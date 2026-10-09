import {z} from 'zod';
import {body,db,env,failure,HttpError,invitation,origin,rate,result} from '../../lib/server';
import {stripe} from '../../lib/stripe';
export async function POST(req:Request){try{
 if(process.env.PAYMENTS_OPEN!=='true')throw new HttpError(503,'Content Pack checkout is not open yet. Your sparring place is unaffected.');
 await rate(req,'checkout',20);const {token,terms_version}=z.object({token:z.string(),accept_terms:z.literal(true),terms_version:z.number().int().nonnegative()}).parse(await body(req));const {c,m}=await invitation(token);
 if(c.status!=='CONFIRMED'||m.status!=='CONFIRMED')throw new HttpError(409,'Checkout opens after both fighters have confirmed.');
 if(!m.content_terms||m.content_terms.trim().length<30||terms_version!==m.content_terms_version)throw new HttpError(409,'Order details changed or are not ready. Refresh your invitation before checkout.');
 const client=stripe();const price=await client.prices.retrieve(env('STRIPE_CONTENT_PACK_PRICE_ID'));
 if(!price.active||price.currency!=='usd'||price.unit_amount!==9900||price.type!=='one_time')throw new HttpError(503,'Content Pack pricing is not configured correctly.');
 const existing=await db().from('orders').select('*').eq('fighter_id',c.fighter_id).eq('matchup_id',m.id).maybeSingle();
 if(existing.error)throw new HttpError(503,'Unable to check your order.');
 if(existing.data?.payment_status==='PENDING'&&existing.data.stripe_checkout_session_id){
  const checkout=await client.checkout.sessions.retrieve(existing.data.stripe_checkout_session_id);
  if(checkout.status==='open')return Response.json({url:checkout.url});
  if(checkout.status==='complete')throw new HttpError(409,'Payment is processing. Please wait for confirmation.');
  if(checkout.status==='expired')result(await db().from('orders').update({payment_status:'FAILED'}).eq('id',existing.data.id).eq('payment_status','PENDING').select('id').single());
 }
 const reserved=await db().rpc('reserve_content_order',{p_matchup:m.id,p_fighter:c.fighter_id,p_terms_version:terms_version});if(reserved.error)throw new HttpError(409,'Content already purchased, or this matchup is no longer eligible.');
 const o=reserved.data;const f=result(await db().from('fighters').select('email').eq('id',c.fighter_id).single());
 const metadata={order_id:o.id,fighter_id:c.fighter_id,matchup_id:m.id,product_type:'CONTENT_PACK',attempt:String(o.attempt)};
 const checkout=await client.checkout.sessions.create({mode:'payment',allowed_payment_method_types:['card'],customer_email:f.email,line_items:[{price:price.id,quantity:1}],client_reference_id:o.id,metadata,payment_intent_data:{metadata},success_url:`${origin()}/match/${token}?payment=processing`,cancel_url:`${origin()}/match/${token}?payment=cancelled`},{idempotencyKey:`content-${o.id}-${o.attempt}`});
 result(await db().from('orders').update({stripe_checkout_session_id:checkout.id,checkout_expires_at:new Date(checkout.expires_at*1000).toISOString()}).eq('id',o.id).eq('attempt',o.attempt).select('id').single());
 return Response.json({url:checkout.url});
}catch(e){return failure(e);}}

