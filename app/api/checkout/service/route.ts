import {z} from 'zod';
import {body,failure,hash,HttpError,rate} from '../../../lib/server';
import {transaction} from '../../../lib/postgres';
import {orderCheckout} from '../../../lib/standalone-checkout';
export async function POST(req:Request){try{
 await rate(req,'service-checkout',20);const d=z.object({token:z.string().regex(/^[A-Za-z0-9_-]{43}$/),accept_terms:z.literal(true),quote_version:z.number().int()}).parse(await body(req));
 if(process.env.PAYMENTS_OPEN!=='true')throw new HttpError(503,'Payments are not open.');
 const value=await transaction(async c=>{
  const s=(await c.query('SELECT * FROM service_requests WHERE payment_token_hash=$1 AND payment_expires_at>now() FOR UPDATE',[hash(d.token)])).rows[0];
  if(!s)throw new HttpError(404,'This quote link is invalid or expired. Ask the organizer for a new one.');
  if(s.status!=='QUOTED'||s.quote_version!==d.quote_version||!s.quote_amount_cents||s.quote_currency!=='usd'||!s.quote_terms)throw new HttpError(409,'This quote is no longer ready for payment.');
  await c.query("INSERT INTO orders(service_request_id,product_type,amount,currency,terms_snapshot,terms_accepted_at,offer_version) VALUES($1,$2,$3,$4,$5,now(),$6) ON CONFLICT DO NOTHING",[s.id,s.kind,s.quote_amount_cents,s.quote_currency,s.quote_terms,s.quote_version]);
  const o=(await c.query('SELECT * FROM orders WHERE service_request_id=$1 FOR UPDATE',[s.id])).rows[0];
  if(o.amount!==s.quote_amount_cents||o.offer_version!==s.quote_version)throw new HttpError(409,'Existing order differs from this quote. Contact the organizer.');
  return orderCheckout(c,o,s.email,'/pay/service/'+d.token);
 });return Response.json(value);
 }catch(e){return failure(e);}}
