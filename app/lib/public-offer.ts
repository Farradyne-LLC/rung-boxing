import 'server-only';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {parse} from 'yaml';
import {z} from 'zod';
import {hash,HttpError} from './server';
const text=z.string().trim().min(1);
const schema=z.object({version:z.number().int().positive(),content_pack:z.object({price_usd:z.literal(99),rounds_scope:text,reel_length:text,file_formats:text,delivery_start:text,delivery_window_days:z.number().int().positive(),refund_if_no_session_days:z.number().int().positive(),cancellation_terms:text,non_delivery_remedy:text})});
export function publicOffer(){
 let raw:unknown;try{raw=parse(readFileSync(process.env.PUBLIC_OFFER_PATH||path.join(process.cwd(),'config/public-offer.yaml'),'utf8'));}catch{throw new HttpError(503,'Prepayment is unavailable until the owner confirms the Content Pack terms.');}
 const r=schema.safeParse(raw);if(!r.success)throw new HttpError(503,'Prepayment is unavailable: Content Pack scope, delivery and cancellation terms need owner approval.');
 const snapshot=JSON.stringify(r.data);return {...r.data,snapshot,hash:hash(snapshot)};
}
