import 'server-only';
import type {PoolClient} from 'pg';
import {stripe} from './stripe';
import {HttpError,origin} from './server';
import type Stripe from 'stripe';
export type PayOrder={id:string;fighter_id:string|null;service_request_id:string|null;matchup_id:string|null;product_type:string;amount:number;currency:string;attempt:number;payment_status:string;stripe_checkout_session_id:string|null};
// Caller holds the order row lock for reservation, provider creation and persistence.
export async function orderCheckout(c:PoolClient,o:PayOrder,email:string,returnPath:string,priceId?:string){
 const client=stripe();
 if(['PAID','REFUNDED'].includes(o.payment_status))throw new HttpError(409,'This order has already been paid.');
 if(o.stripe_checkout_session_id&&o.payment_status==='PENDING'){
  const old=await client.checkout.sessions.retrieve(o.stripe_checkout_session_id);
  if(old.status==='open')return {url:old.url};
  if(old.status==='complete')throw new HttpError(409,'Payment is processing. Please wait for confirmation.');
  o=(await c.query("UPDATE orders SET payment_status='FAILED' WHERE id=$1 RETURNING *",[o.id])).rows[0];
 }
 if(o.payment_status==='FAILED')o=(await c.query("UPDATE orders SET payment_status='PENDING',attempt=attempt+1,stripe_checkout_session_id=NULL WHERE id=$1 RETURNING *",[o.id])).rows[0];
 const metadata={order_id:o.id,fighter_id:o.fighter_id||'',matchup_id:o.matchup_id||'',service_request_id:o.service_request_id||'',product_type:o.product_type,attempt:String(o.attempt)};
 const line:Stripe.Checkout.SessionCreateParams.LineItem=priceId?{price:priceId,quantity:1}:{price_data:{currency:o.currency,unit_amount:o.amount,product_data:{name:o.product_type==='HIGHLIGHT_EDIT'?'Punch Highlight Edit':'Punch Private Shoot'}},quantity:1};
 const checkout=await client.checkout.sessions.create({mode:'payment',allowed_payment_method_types:['card'],customer_email:email,line_items:[line],client_reference_id:o.id,metadata,payment_intent_data:{metadata},success_url:origin()+returnPath+'?payment=processing',cancel_url:origin()+returnPath+'?payment=cancelled'},{idempotencyKey:`standalone-${o.id}-${o.attempt}`});
 await c.query('UPDATE orders SET stripe_checkout_session_id=$2,checkout_expires_at=$3 WHERE id=$1',[o.id,checkout.id,new Date(checkout.expires_at*1000)]);
 return {url:checkout.url};
}
