import 'server-only';
import {cookies} from 'next/headers';
import {randomBytes,scryptSync,timingSafeEqual} from 'node:crypto';
import {sql} from './postgres';
import {hash} from './server';
export function verifyPassword(password:string,encoded:string){const [salt,key]=encoded.split(':');if(!salt||!key)return false;const actual=scryptSync(password,salt,64);const expected=Buffer.from(key,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected);}
export async function createSession(adminId:string){const token=randomBytes(32).toString('hex');await sql().query("INSERT INTO admin_sessions VALUES($1,$2,now()+interval '8 hours')",[hash(token),adminId]);(await cookies()).set('pm-admin',token,{httpOnly:true,secure:process.env.ADMIN_URL?.startsWith('https:')??true,sameSite:'strict',path:'/',maxAge:28800});}
