// Synthetic signed webhook cases. Actual Stripe delivery is verified separately.
const assert=require('node:assert/strict'),fs=require('fs'),{Pool}=require('pg'),Stripe=require('stripe'),{randomUUID}=require('crypto');
(async()=>{assert.equal(new URL(process.env.DATABASE_URL).pathname,'/rung_preview');assert(!process.env.RESEND_API_KEY);assert(process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'));
 const u=new URL(process.env.DATABASE_URL);u.password=fs.readFileSync(process.env.DB_PASSWORD_FILE,'utf8').trim();const db=new Pool({connectionString:u.toString()}),stripe=new Stripe(process.env.STRIPE_SECRET_KEY),qa=JSON.parse(fs.readFileSync('/tmp/stripe-qa.json','utf8'));
 const checkout=await stripe.checkout.sessions.retrieve(qa.checkout_id);assert.equal(checkout.livemode,false);
 async function event(overrides={},signed=true,type='checkout.session.completed',id='evt_synthetic_'+randomUUID()){const payload=JSON.stringify({id,object:'event',livemode:false,type,data:{object:{...checkout,...overrides}}});const sig=signed?stripe.webhooks.generateTestHeaderString({payload,secret:process.env.STRIPE_WEBHOOK_SECRET}):'invalid';return fetch('http://127.0.0.1:3000/api/stripe/webhook',{method:'POST',headers:{'Content-Type':'application/json','Stripe-Signature':sig},body:payload});}
 const state=async()=>(await db.query('SELECT payment_status FROM orders WHERE id=$1',[qa.order_id])).rows[0].payment_status;
 const before=await state();assert.equal((await event({},false)).status,400);assert.equal((await event({payment_status:'unpaid'})).status,200);assert.equal(await state(),before);
 assert.notEqual((await event({payment_status:'paid',amount_total:1})).status,200);assert.notEqual((await event({payment_status:'paid',id:'cs_test_wrong'})).status,200);assert.equal(await state(),before);
 const paidEventId='evt_synthetic_'+randomUUID();assert.equal((await event({payment_status:'paid'},true,'checkout.session.completed',paidEventId)).status,200);assert.equal((await event({payment_status:'paid'},true,'checkout.session.completed',paidEventId)).status,200);assert.equal(await state(),'PAID');
 assert.equal((await db.query('SELECT count(*)::int n FROM notification_outbox WHERE dedupe_key=$1',['paid-'+qa.order_id])).rows[0].n,1);assert.equal((await db.query('SELECT count(*)::int n FROM stripe_events WHERE id=$1',[paidEventId])).rows[0].n,1);
 assert.equal((await event({payment_status:'unpaid'},true,'checkout.session.expired')).status,200);assert.equal(await state(),'PAID');
 console.log('PASS synthetic webhooks: bad signature, unpaid completion, wrong amount/session, duplicate event, one receipt queue, late failure cannot undo paid.');await db.end();
})().catch(e=>{console.error(e.message);process.exit(1)});
