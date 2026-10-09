import {after} from 'next/server';
import Stripe from 'stripe';
import {db,env,failure,HttpError,result} from '../../../lib/server';
import {stripe} from '../../../lib/stripe';
import {flushNotifications} from '../../../lib/notifications';
export async function POST(req:Request){
 let event:Stripe.Event;
 try{event=stripe().webhooks.constructEvent(await req.text(),req.headers.get('stripe-signature')||'',env('STRIPE_WEBHOOK_SECRET'));}catch{return Response.json({error:'Invalid webhook signature.'},{status:400});}
 try{
  if(event.livemode!==env('STRIPE_SECRET_KEY').startsWith('sk_live_'))throw new HttpError(400,'Payment mode mismatch.');
  if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','checkout.session.expired'].includes(event.type)){
   const s=event.data.object as Stripe.Checkout.Session;
   if(s.metadata?.product_type!=='CONTENT_PACK')return Response.json({received:true});
   const order=result(await db().from('orders').select('*').eq('id',s.metadata.order_id).single());
   if(s.metadata.fighter_id!==order.fighter_id||s.metadata.matchup_id!==order.matchup_id||s.client_reference_id!==order.id)throw new HttpError(400,'Payment metadata mismatch.');
   if(s.metadata.attempt&&s.metadata.attempt!==String(order.attempt))return Response.json({received:true,ignored:'superseded_attempt'});
   const paid=s.payment_status==='paid';
   if(!paid&&['checkout.session.completed','checkout.session.async_payment_succeeded'].includes(event.type))return Response.json({received:true});
   result(await db().rpc('record_payment',{p_event:event.id,p_order:order.id,p_checkout:s.id,p_intent:typeof s.payment_intent==='string'?s.payment_intent:s.payment_intent?.id||null,p_state:paid?'PAID':'FAILED',p_amount:s.amount_total,p_currency:s.currency,p_refunded:0}));
  }else if(event.type==='charge.refunded'){
   const c=event.data.object as Stripe.Charge;const pi=typeof c.payment_intent==='string'?c.payment_intent:c.payment_intent?.id;
   if(pi){const found=await db().from('orders').select('*').eq('stripe_payment_intent_id',pi).maybeSingle();if(found.error)throw new HttpError(503,'Unable to load payment.');const order=found.data;if(!order)return Response.json({received:true});
    result(await db().rpc('record_payment',{p_event:event.id,p_order:order.id,p_checkout:order.stripe_checkout_session_id,p_intent:pi,p_state:'REFUNDED',p_amount:c.amount,p_currency:c.currency,p_refunded:c.amount_refunded}));}
  }
  after(flushNotifications);return Response.json({received:true});
 }catch(e){return failure(e);}
}
