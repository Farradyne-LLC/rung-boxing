const {loadEnvConfig}=require('@next/env');
const {Client}=require('pg');
const fs=require('node:fs');
loadEnvConfig(process.cwd());
(async()=>{
 const url=new URL(process.env.POSTGRES_URL_NON_POOLING);
 url.searchParams.delete('sslmode');
 const c=new Client({connectionString:url.toString(),ssl:{ca:fs.readFileSync('scripts/supabase-ca.crt','utf8'),rejectUnauthorized:true},connectionTimeoutMillis:15000});
 try {
  await c.connect();await c.query('begin');await c.query("select pg_advisory_xact_lock(hashtext('punch-migrations'))");
  await c.query('create schema if not exists punch_internal');
  await c.query('create table if not exists punch_internal.migrations(name text primary key, applied_at timestamptz default now())');
  for(const file of fs.readdirSync('supabase/migrations').filter(f=>f.endsWith('.sql')).sort()){
   if((await c.query('select 1 from punch_internal.migrations where name=$1',[file])).rowCount)continue;
   await c.query(fs.readFileSync('supabase/migrations/'+file,'utf8'));
   await c.query('insert into punch_internal.migrations(name) values($1)',[file]);console.log('Applied:',file);
  }
  await c.query("notify pgrst, 'reload schema'");await c.query('commit');console.log('Migrations committed.');
 }catch(e){await c.query('rollback').catch(()=>{});console.error('Migration failed:',e.code,e.message);process.exitCode=1;}finally{await c.end();}
})();
