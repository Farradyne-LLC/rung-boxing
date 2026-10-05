const assert=require('node:assert/strict');const fs=require('node:fs');const {randomUUID}=require('node:crypto');
const base='http://gateway:8080',privateBase='http://gateway:8081',origin='http://100.102.7.5:3101';
const data=()=>({request_id:randomUUID(),first_name:'QA',last_name:'Youth',display_name:'QA Private Youth',date_of_birth:'2010-01-01',email:'vps-qa-youth@example.com',phone:'2025550101',instagram:'',city:'Los Angeles',gym:'QA Gym',height:68,current_weight:150,stance:'Orthodox',years_boxing:2,amateur_fights:0,professional_fights:0,competition_experience:'No fights',sparring_experience:'Supervised technical sparring',skill_level:'Developing',preferred_intensity:'Technical/light',availability:'Saturday',video_url:'https://youtu.be/aqz-KE-bpKQ',notes:'Synthetic QA record',emergency_name:'QA guardian',emergency_phone:'2025550102',visibility:'PUBLIC',media_consent:true,rules_accepted:true,accuracy_accepted:true,no_guarantee_accepted:true,recording_accepted:true,guardian_name:'QA Guardian',guardian_contact:'qa-guardian@example.com',website:''});
async function submit(d,files=[]){const f=new FormData();f.set('application',JSON.stringify(d));for(const file of files)f.append('photos',new Blob([file.bytes],{type:file.type}),file.name);return fetch(base+'/api/applications',{method:'POST',headers:{Origin:origin},body:f});}
(async()=>{
 for(const path of ['/admin','/admin/login','/api/admin/export','/api/admin/manage','/api/notifications','/%61dmin','/api/%61dmin/export']){const r=await fetch(base+path,{headers:{'X-Punch-Admin-Ingress':'spoof','X-Middleware-Subrequest':'middleware'},redirect:'manual'});assert.equal(r.status,404,path);}
 assert.equal((await fetch(privateBase+'/api/admin/export')).status,401);
 const image={bytes:fs.readFileSync('/test-photo.jpg'),type:'image/jpeg',name:'photo.jpg'};
 assert.equal((await submit(data(),Array(4).fill(image))).status,400,'four photos');
 assert.equal((await submit(data(),[{bytes:Buffer.from('<svg/>'),type:'image/jpeg',name:'fake.jpg'}])).status,400,'fake image');
 assert.equal((await submit({...data(),website:'spam'})).status,400,'honeypot');
 const d=data();const r=await submit(d,[image,image,image]);assert.equal(r.status,201,await r.text().then(t=>{try{return JSON.parse(t).id? 'saved':t;}catch{return t;}}));
 const duplicate=await submit(d,[image]);assert.equal(duplicate.status,201);const id=(await duplicate.json()).id;
 assert.equal((await submit({...data(),date_of_birth:'invalid'})).status,400);
 assert.equal((await submit(data())).status,429,'rate limit');
 const huge=await fetch(base+'/api/applications',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:'x'.repeat(17*1024*1024)});assert.equal(huge.status,413,'proxy request limit');
 const password=fs.readFileSync('/bootstrap/admin-login.txt','utf8').match(/Password: (.+)/)[1].trim();const login=await fetch(privateBase+'/api/admin/login',{method:'POST',headers:{Origin:'http://100.102.7.5:3100','Content-Type':'application/json'},body:JSON.stringify({email:'farukhimin@gmail.com',password})});assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
 const detail=await fetch(privateBase+'/admin/applications/'+id,{headers:{Cookie:cookie}});assert.equal(detail.status,200);const html=await detail.text();assert.ok(html.includes('GUARDIAN REVIEW'));assert.ok(html.includes('PRIVATE'));const photo=html.match(/\/api\/photos\/[a-f0-9-]{36}/)[0];assert.equal((await fetch(base+photo,{headers:{Cookie:cookie}})).status,404);assert.equal((await fetch(privateBase+photo)).status,404);assert.equal((await fetch(privateBase+photo,{headers:{Cookie:cookie}})).status,200);
 console.log('PASS: public admin/API denial, spoofed headers, upload validation, 3 photos, youth Private, idempotent retry, rate limit, body limit, authorized photo access');
})().catch(e=>{console.error(e.message);process.exitCode=1;});
