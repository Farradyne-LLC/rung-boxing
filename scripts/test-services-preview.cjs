// Isolated preview only: synthetic data and Stripe test mode, no email delivery.
const assert=require('node:assert/strict'),fs=require('fs'),{Pool}=require('pg'),{randomUUID,randomBytes,createHash}=require('crypto');
const hash=s=>createHash('sha256').update(s).digest('hex');
(async()=>{
 assert.equal(new URL(process.env.DATABASE_URL).pathname,'/rung_preview');assert(!process.env.RESEND_API_KEY);assert(process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'));
 const u=new URL(process.env.DATABASE_URL);u.password=fs.readFileSync(process.env.DB_PASSWORD_FILE,'utf8').trim();const db=new Pool({connectionString:u.toString()});
 const user=(await db.query("SELECT id FROM admin_users WHERE email='preview@example.com'")).rows[0],session=randomBytes(32).toString('hex');await db.query("INSERT INTO admin_sessions VALUES($1,$2,now()+interval '1 hour')",[hash(session),user.id]);
 async function req(path,data,admin=false,method='POST',ingress=true){return fetch('http://127.0.0.1:3000'+path,{method,headers:{Origin:process.env.APP_URL,'X-Punch-Client-IP':randomUUID(),...(ingress?{'X-Punch-Admin-Ingress':process.env.ADMIN_INGRESS_SECRET}:{}),...(admin?{Cookie:'pm-admin='+session}:{}),'Content-Type':'application/json'},body:data&&JSON.stringify(data),redirect:'manual'});}
 const edit={request_id:randomUUID(),kind:'HIGHLIGHT_EDIT',name:'QA Edit',email:'qa-edit@example.com',brief:'Synthetic preview request',edit_type:'Personal highlight',rights_confirmed:true};
 assert.equal((await req('/api/service-requests',{...edit,rights_confirmed:false})).status,400);
 assert.equal((await req('/api/service-requests',{...edit,source_url:'javascript:alert(1)'})).status,400);
 for(let i=0;i<2;i++)assert.equal((await req('/api/service-requests',edit)).status,200);
 const rows=(await db.query('SELECT * FROM service_requests WHERE request_id=$1',[edit.request_id])).rows;assert.equal(rows.length,1);assert.equal((await db.query('SELECT count(*)::int n FROM notification_outbox WHERE dedupe_key=$1',['service-'+rows[0].id])).rows[0].n,1);
 assert.equal((await req('/api/service-requests',{request_id:randomUUID(),kind:'PRIVATE_SHOOT',name:'QA Shoot',email:'qa-shoot@example.com',brief:'Synthetic request',shoot_type:'Training session',location:'Los Angeles',preferred_dates:'Flexible'})).status,200);
 const update={action:'SERVICE_REQUEST',data:{id:rows[0].id,version:0,status:'NEEDS_MATERIAL',internal_notes:'QA',response_notes:''}};
 assert.equal((await req('/api/admin/manage',update)).status,401);assert.equal((await req('/api/admin/manage',update,true,'POST',false)).status,404);
 assert.equal((await req('/api/admin/manage',update,true)).status,400);update.data.response_notes='Ask the client for a source link.';assert.equal((await req('/api/admin/manage',update,true)).status,200);assert.equal((await req('/api/admin/manage',update,true)).status,409);
 assert.equal((await db.query("SELECT count(*)::int n FROM audit_log WHERE entity_id=$1 AND action='SERVICE_REQUEST'",[rows[0].id])).rows[0].n,1);
 assert.equal((await req('/api/admin/export?type=services',null,true,'GET')).status,200);
 console.log('PASS services: validation, two request types, retry dedupe, notification queue, protected admin, audited updates, stale write rejection, CSV.');
 const input={instagram:'qa_boxer',notes:'',video_url:'',emergency_name:'',emergency_phone:'',guardian_name:'',guardian_contact:'',first_name:'Sandbox',last_name:'Boxer',display_name:'Sandbox',date_of_birth:'1995-01-01',email:'qa-stripe@example.com',phone:'2025550100',city:'LA',gym:'',height:70,current_weight:175,stance:'Orthodox',years_boxing:3,amateur_fights:0,professional_fights:0,competition_experience:'No fights',sparring_experience:'Weekly',skill_level:'Intermediate',visibility:'PRIVATE',availability:'Weekend mornings',preferred_intensity:'Technical/light',media_consent:false,rules_accepted:true,accuracy_accepted:true,no_guarantee_accepted:true,recording_accepted:true,terms_version:'test'};
 const ids=[];for(let i=0;i<2;i++)ids.push((await db.query('SELECT submit_application($1,$2,$3,$4) id',[{...input,first_name:'Sandbox'+i},randomUUID(),'preview@example.com',process.env.APP_URL])).rows[0].id);
 const sid=(await db.query("INSERT INTO sessions(title,slug,date,start_time,location_name,city) VALUES('Synthetic QA session',$1,current_date+7,'12:00','Test venue','Los Angeles') RETURNING id",['qa-'+randomUUID()])).rows[0].id;
 let r=await req('/api/admin/manage',{action:'MATCHUP',data:{application_a_id:ids[0],application_b_id:ids[1],session_id:sid,rounds:3,round_length:180,internal_notes:'Sandbox only'}},true);const made=await r.json();assert.equal(r.status,200,JSON.stringify(made));
 const m=made.data||made.value||made;const token=m.link_a.split('/').pop(),tokenB=m.link_b.split('/').pop();const checkout={token,accept_terms:true,terms_version:1};
 assert.equal((await req('/api/checkout',checkout)).status,409);
 for(const t of [token,tokenB]){r=await req('/api/match/respond',{token:t,accept:true,emergency_name:'QA Contact',emergency_phone:'2025550101'});assert.equal(r.status,200,await r.text());}
 assert.equal((await req('/api/checkout',checkout)).status,409);
 r=await req('/api/admin/manage',{action:'CONTENT_TERMS',data:{id:m.id,version:0,content_terms:'SANDBOX TEST ONLY. One agreed sparring recording and one shared vertical reel. Three correction rounds. Google Drive delivery. Synthetic test terms; no real service or payment.'}},true);assert.equal(r.status,200,await r.text());
 assert.equal((await req('/api/checkout',{...checkout,accept_terms:false})).status,400);
 r=await req('/api/checkout',checkout);const payment=await r.json();assert.equal(r.status,200,JSON.stringify(payment));assert(payment.url.startsWith('https://checkout.stripe.com/'));
 r=await req('/api/checkout',checkout);assert.equal((await r.json()).url,payment.url);
 const order=(await db.query('SELECT * FROM orders WHERE matchup_id=$1',[m.id])).rows[0];assert.equal(order.payment_status,'PENDING');assert.equal(order.amount,9900);assert(order.terms_snapshot.includes('SANDBOX'));
 await req('/match/'+token+'?payment=processing',null,false,'GET');assert.equal((await db.query('SELECT payment_status FROM orders WHERE id=$1',[order.id])).rows[0].payment_status,'PENDING');
 const Stripe=require('stripe'),stripe=new Stripe(process.env.STRIPE_SECRET_KEY);const s=await stripe.checkout.sessions.retrieve(order.stripe_checkout_session_id);assert.equal(s.livemode,false);assert.equal(s.amount_total,9900);assert.equal(s.currency,'usd');
 fs.writeFileSync('/tmp/stripe-qa.json',JSON.stringify({order_id:order.id,checkout_id:s.id,url:payment.url,matchup_id:m.id,token}),{mode:0o600});
 console.log('PASS checkout: both confirmations required, terms required, explicit acceptance, $99 USD server price, one pending order/session, redirect cannot mark paid. Test checkout prepared.');
 await db.end();
})().catch(e=>{console.error(e.message);process.exit(1)});
