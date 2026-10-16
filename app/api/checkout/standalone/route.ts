import {z} from 'zod';
import {member} from '../../../lib/member';
import {publicOffer} from '../../../lib/public-offer';
import {body,env,failure,HttpError,rate} from '../../../lib/server';
import {transaction} from '../../../lib/postgres';
import {stripe} from '../../../lib/stripe';
import {orderCheckout} from '../../../lib/standalone-checkout';
export async function GET(){try{await member();return Response.json(publicOffer(),{headers:{'Cache-Control':'private, no-store'}});}catch(e){return failure(e);}}
export async function POST(req:Request){try{
 const f=await member();await rate(req,'standalone-checkout',20);const d=z.object({accept_terms:z.literal(true),terms_version:z.number().int(),offer_hash:z.string()}).parse(await body(req));
 if(process.env.PAYMENTS_OPEN!=='true')throw new HttpError(503,'Payments are not open.');
 const offer=publicOffer();if(offer.version!==d.terms_version||offer.hash!==d.offer_hash)throw new HttpError(409,'Order terms changed. Refresh and review them before paying.');
 const price=await stripe().prices.retrieve(env('STRIPE_CONTENT_PACK_PRICE_ID'));
 if(!price.active||price.currency!=='usd'||price.unit_amount!==9900||price.type!=='one_time')throw new HttpError(503,'Content Pack pricing is not configured correctly.');
 const value=await transaction(async c=>{
  const paid=await c.query("SELECT 1 FROM orders WHERE fighter_id=$1 AND product_type='CONTENT_PACK_PREPAID' AND matchup_id IS NULL AND payment_status IN ('PAID','REFUNDED')",[f.id]);if(paid.rowCount)throw new HttpError(409,'This pack has already been purchased.');
  const o=(await c.query("SELECT * FROM reserve_standalone_order($1,'CONTENT_PACK_PREPAID',$2)",[f.id,offer.version])).rows[0];
  if(o.terms_snapshot&&o.terms_snapshot!==offer.snapshot)throw new HttpError(409,'Existing checkout uses different terms. Contact the organizer.');
  await c.query('UPDATE orders SET terms_snapshot=$2,terms_accepted_at=now() WHERE id=$1',[o.id,offer.snapshot]);
  return orderCheckout(c,o,f.email,'/pay/content-pack',price.id);
 });return Response.json(value);
 }catch(e){return failure(e);}}
