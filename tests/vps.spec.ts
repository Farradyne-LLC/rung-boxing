import {test,expect} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
const enabled=!!process.env.VPS_QA;
test.skip(!enabled,'Explicit VPS integration test only');
test('real application, photos, private access, admin and embedded profile',async({page,request},testInfo)=>{
 await page.addInitScript(()=>{const original=window.fetch;window.fetch=(input,init)=>{if(String(input)==='/api/applications'&&init?.body instanceof FormData)Object.defineProperty(window,'qaApplication',{value:String(init.body.get('application')),configurable:true});return original(input,init);};});
 const email=`vps-qa-${testInfo.project.name}-${Date.now()}@example.com`;
 await page.goto('/apply');
 for(const[k,v]of Object.entries({first_name:'QA',last_name:'VPS Test',display_name:'QA VPS '+testInfo.project.name,date_of_birth:'1995-04-12',email,phone:'2025550123',city:'Los Angeles',gym:'QA gym',emergency_name:'QA contact',emergency_phone:'2025550124'}))await page.locator(`[name=${k}]`).fill(v);
 await page.getByRole('button',{name:'CONTINUE'}).click();await page.locator('[name=height]').selectOption('70');
 for(const[k,v]of Object.entries({current_weight:'175',years_boxing:'3',sparring_experience:'Weekly technical rounds',availability:'Saturday',video_url:'https://www.youtube.com/watch?v=aqz-KE-bpKQ'}))await page.locator(`[name=${k}]`).fill(v);
 await page.locator('[name=stance]').selectOption('Orthodox');await page.locator('[name=skill_level]').selectOption('Intermediate');await page.locator('[name=preferred_intensity]').selectOption('Technical/light');await page.getByRole('button',{name:'CONTINUE'}).click();
 await page.locator('[name=visibility][value=PUBLIC]').check();for(const n of ['no_guarantee_accepted','accuracy_accepted','rules_accepted','recording_accepted','media_consent'])await page.locator(`[name=${n}]`).check();
 await page.locator('input[type=file]').setInputFiles(path.resolve('public/video/poster.jpg'));
 const responsePromise=page.waitForResponse(r=>r.url().endsWith('/api/applications')&&r.request().method()==='POST');await page.getByRole('button',{name:'SUBMIT APPLICATION'}).click();const response=await responsePromise;expect(response.status()).toBe(201);const {id}=await response.json();await expect(page.getByText('APPLICATION RECEIVED.',{exact:true})).toBeVisible();
 // Retry the identical multipart payload, as a browser does after a lost response.
 const application=JSON.parse(await page.evaluate(()=>(window as unknown as {qaApplication:string}).qaApplication));const retry=await request.post('/api/applications',{headers:{Origin:'http://100.102.7.5:3101'},data:application});expect(retry.status()).toBe(201);expect((await retry.json()).id).toBe(id);
 expect((await request.get('/admin')).status()).toBe(404);expect((await request.get('/api/admin/export')).status()).toBe(404);
 const credentials=fs.readFileSync(process.env.VPS_ADMIN_FILE!,'utf8');const password=credentials.match(/Password: (.+)/)![1].trim();
 await page.goto('http://100.102.7.5:3100/admin/login');await page.locator('[name=email]').fill('farukhimin@gmail.com');await page.locator('[name=password]').fill(password);await page.getByRole('button',{name:'SIGN IN',exact:true}).click();await expect(page).toHaveURL(/\/admin$/);
 await page.goto(`http://100.102.7.5:3100/admin/applications/${id}`);await expect(page.locator('h1')).toHaveText('QA VPS '+testInfo.project.name);
 const photo=page.locator('.photo-gallery img');await expect(photo).toHaveCount(1);const photoUrl=await photo.getAttribute('src');expect((await request.get(photoUrl!)).status()).toBe(404);await photo.scrollIntoViewIfNeeded();await expect.poll(()=>photo.evaluate((p:HTMLImageElement)=>p.complete&&p.naturalWidth>0)).toBe(true);
 await page.locator('[name=internal_notes]').fill('QA: verified actual photo submission');await page.locator('[name=application_status]').selectOption('REVIEWING');await page.locator('form').filter({has:page.locator('[name=internal_notes]')}).getByRole('button',{name:'SAVE',exact:true}).click();await expect(page.getByText('Saved.',{exact:true}).first()).toBeVisible();
 const profile=page.locator('form').filter({has:page.locator('[name=profile_published]')});await profile.locator('[name=profile_published]').check();await profile.getByRole('button',{name:'SAVE',exact:true}).click();await expect(profile.getByText('Saved.',{exact:true})).toBeVisible();
 const video=page.locator('form').filter({has:page.locator('[name=permission_confirmed]')});await video.locator('[name=title]').fill('QA embed — temporary test');await video.locator('[name=url]').fill('https://www.youtube.com/watch?v=aqz-KE-bpKQ');await video.locator('[name=published]').check();await video.locator('[name=permission_confirmed]').check();await video.getByRole('button',{name:'ADD VIDEO'}).click();await expect(video.getByText('Saved.',{exact:true})).toBeVisible();
 const link=await page.locator('a[href^="/fighter/"]').getAttribute('href');await page.goto('http://100.102.7.5:3101'+link);await expect(page.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ');expect((await request.get(photoUrl!)).status()).toBe(200);await page.locator('iframe').scrollIntoViewIfNeeded();await expect(page.locator('iframe')).toHaveAttribute('referrerpolicy','strict-origin-when-cross-origin');await expect(page.locator('iframe')).toHaveCSS('aspect-ratio','16 / 9');
 await page.screenshot({path:`../infra-staging/vps-profile-${testInfo.project.name}.png`,fullPage:true});
});
