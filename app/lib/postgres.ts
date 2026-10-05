import 'server-only';
import {Pool, types, type PoolClient} from 'pg';
import {readFileSync} from 'node:fs';
// Preserve date-only values and serialize timestamps consistently with existing UI.
types.setTypeParser(1082, v=>v);
types.setTypeParser(1184, v=>new Date(v).toISOString());
types.setTypeParser(1700, Number);
let pool:Pool;
export function sql(){if(!pool){const url=new URL(process.env.DATABASE_URL!);if(process.env.DB_PASSWORD_FILE)url.password=readFileSync(process.env.DB_PASSWORD_FILE,'utf8').trim();pool=new Pool({connectionString:url.toString(),max:8,connectionTimeoutMillis:5000,statement_timeout:15000});}return pool;}
export async function transaction<T>(work:(client:PoolClient)=>Promise<T>){const c=await sql().connect();try{await c.query('BEGIN');const r=await work(c);await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
const tables=new Set(['fighters','applications','sessions','matchups','fighter_matchup_confirmations','orders','media','notification_outbox','stripe_events','rate_limits','audit_log','subscribers']);
const functions=new Set(['take_rate_limit','submit_application','create_matchup','respond_matchup','reserve_order','record_payment','manage_matchup','subscribe_updates']);
function ident(s:string){if(!/^[a-z_][a-z0-9_]*$/.test(s))throw new Error('Invalid identifier');return '"'+s+'"';}
// Small server-only compatibility layer. Every value is a bound SQL parameter;
// relation names are allowlisted and never come from HTTP input.
class Query {
 private columns='*';private predicates:string[]=[];private values:unknown[]=[];private sort='';private cap='';private offset='';private method='select';private changes:Record<string,unknown>={};private one=false;private optional=false;private count=false;
 constructor(private table:string){if(!tables.has(table))throw new Error('Invalid table');}
 private param(v:unknown){this.values.push(v);return '$'+this.values.length;}
 select(columns='*',options?:{count?:string;head?:boolean}){this.columns=columns;this.count=!!options?.head;return this;}
 insert(values:Record<string,unknown>){this.method='insert';this.changes=values;return this;}
 update(values:Record<string,unknown>){this.method='update';this.changes=values;return this;}
 eq(k:string,v:unknown){this.predicates.push(`${ident(k)}=${this.param(v)}`);return this;}
 gt(k:string,v:unknown){this.predicates.push(`${ident(k)}>${this.param(v)}`);return this;}
 gte(k:string,v:unknown){this.predicates.push(`${ident(k)}>=${this.param(v)}`);return this;}
 lt(k:string,v:unknown){this.predicates.push(`${ident(k)}<${this.param(v)}`);return this;}
 is(k:string,v:null){if(v!==null)throw new Error('Unsupported');this.predicates.push(`${ident(k)} IS NULL`);return this;}
 in(k:string,v:unknown[]){this.predicates.push(v.length?`${ident(k)} IN (${v.map(x=>this.param(x)).join(',')})`:'false');return this;}
 not(k:string,op:string,v:string){if(op!=='in'||!/^\([A-Z,]+\)$/.test(v))throw new Error('Unsupported filter');this.predicates.push(`${ident(k)} NOT IN (${v.slice(1,-1).split(',').map(x=>this.param(x)).join(',')})`);return this;}
 or(v:string){this.predicates.push('('+v.split(',').map(x=>{const [k,op,value]=x.split('.');if(op!=='eq')throw new Error('Unsupported filter');return `${ident(k)}=${this.param(value)}`;}).join(' OR ')+')');return this;}
 order(k:string,o?:{ascending?:boolean}){this.sort=` ORDER BY ${ident(k)} ${o?.ascending===false?'DESC':'ASC'}`;return this;}
 limit(n:number){this.cap=` LIMIT ${Math.min(10000,Math.max(0,Math.floor(n)))}`;return this;}
 range(a:number,b:number){this.limit(b-a+1);this.offset=` OFFSET ${Math.max(0,Math.floor(a))}`;return this;}
 single(){this.one=true;return this;}
 maybeSingle(){this.one=true;this.optional=true;return this;}
 private projection(){return this.columns.split(/,(?![^()]*\))/).map(c=>{
  const relation=c.match(/^fighters\((.*)\)$/);
  if(relation){if(this.table!=='applications')throw new Error('Unsupported relation');const fields=relation[1]==='*'?'f.*':relation[1].split(',').map(k=>'f.'+ident(k)).join(',');return `(SELECT row_to_json(n) FROM (SELECT ${fields} FROM fighters f WHERE f.id=t.fighter_id) n) AS fighters`;}
  return c==='*'?'t.*':'t.'+ident(c);
 }).join(',');}
 async execute(){try{
  let statement:string;const where=this.predicates.length?' WHERE '+this.predicates.join(' AND '):'';
  if(this.method==='insert'){const entries=Object.entries(this.changes);statement=`INSERT INTO ${ident(this.table)} (${entries.map(([k])=>ident(k)).join(',')}) VALUES (${entries.map(([,v])=>this.param(v)).join(',')}) RETURNING *`;}
  else if(this.method==='update'){if(!where)throw new Error('Unbounded update');statement=`UPDATE ${ident(this.table)} SET ${Object.entries(this.changes).map(([k,v])=>`${ident(k)}=${this.param(v)}`).join(',')}${where} RETURNING *`;}
  else statement=`SELECT ${this.count?'count(*)::int AS total':this.projection()} FROM ${ident(this.table)} t${where}${this.sort}${this.cap}${this.offset}`;
  const r=await sql().query(statement,this.values);if(this.one&&(r.rows.length>1||(!this.optional&&!r.rows.length)))throw new Error('Expected one row');
  return {data:this.count?null:this.one?r.rows[0]??null:r.rows,error:null,count:this.count?r.rows[0].total:null};
 }catch(e){console.error('Database query failed',e instanceof Error?e.name:'Error');return {data:null,error:{message:e instanceof Error?e.message:'Database error'},count:null};}}
 then<A,B>(resolve:(v:Awaited<ReturnType<Query['execute']>>)=>A,reject?:(e:unknown)=>B){return this.execute().then(resolve,reject);}
}
export const postgres={from:(name:string)=>new Query(name),async rpc(name:string,args:Record<string,unknown>){try{if(!functions.has(name))throw new Error('Unknown function');const keys=Object.keys(args);const r=await sql().query(`SELECT public.${ident(name)}(${keys.map((k,i)=>`${ident(k)} => $${i+1}`).join(',')}) AS value`,Object.values(args));return {data:r.rows[0].value,error:null};}catch(e){return {data:null,error:{message:e instanceof Error?e.message:'Database error'}};}}};
