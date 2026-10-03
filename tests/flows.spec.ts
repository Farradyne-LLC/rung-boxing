import {test,expect,type Page} from '@playwright/test';
async function enterDetails(page:Page){
 await page.goto('/apply');
 for(const[k,v]of Object.entries({first_name:'QA',last_name:'Test',display_name:'QA Boxer',date_of_birth:'1995-04-12',email:'qa@example.com',phone:'2025550123',city:'Los Angeles',gym:'QA gym',emergency_name:'QA contact',emergency_phone:'2025550124'}))await page.locator(`[name=${k}]`).fill(v);
 await page.getByRole('button',{name:'CONTINUE'}).click();
 await page.locator('[name=height]').selectOption('70');
 for(const[k,v]of Object.entries({current_weight:'175',years_boxing:'3',sparring_experience:'Weekly supervised rounds',availability:'Saturday morning'}))await page.locator(`[name=${k}]`).fill(v);
 await page.locator('[name=stance]').selectOption('Orthodox');await page.locator('[name=skill_level]').selectOption('Intermediate');await page.locator('[name=preferred_intensity]').selectOption('Technical/light');
 await page.getByRole('button',{name:'CONTINUE'}).click();
}
test('height labels, draft recovery, public/private and retry without losing fields',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await enterDetails(page);
 await page.locator('[name=visibility][value=PUBLIC]').check();await page.reload();await expect(page.locator('[name=visibility][value=PUBLIC]')).toBeChecked();
 await page.getByRole('button',{name:'BACK',exact:true}).click();await expect(page.locator('[name=height]')).toHaveValue('70');await expect(page.locator('[name=height] option:checked')).toHaveText('5′10″ (178 cm)');
 await page.getByRole('button',{name:'CONTINUE'}).click();await page.locator('[name=visibility][value=PRIVATE]').check();await expect(page.locator('[name=media_consent]')).toHaveCount(0);
 for(const n of ['no_guarantee_accepted','accuracy_accepted','rules_accepted','recording_accepted'])await page.locator(`[name=${n}]`).check();
 await page.route('**/api/applications',r=>r.fulfill({status:503,json:{error:'Temporary test outage'}}));await page.getByRole('button',{name:'SUBMIT APPLICATION'}).click();await expect(page.locator('form [role=alert]')).toContainText('Temporary test outage');await expect(page.locator('[name=visibility][value=PRIVATE]')).toBeChecked();
 await page.unroute('**/api/applications');await page.route('**/api/applications',r=>r.fulfill({status:201,json:{id:'test-only-response'}}));await page.getByRole('button',{name:'SUBMIT APPLICATION'}).click();await expect(page.getByText('APPLICATION RECEIVED.',{exact:true})).toBeVisible();expect(await page.evaluate(()=>sessionStorage.getItem('punch-application-mvp-v1'))).toBeNull();expect(errors).toEqual([]);
});
test('responsive video, photo gallery and private admin',async({page})=>{
 await page.goto('/');const v=page.locator('video');await expect(v).toHaveAttribute('src',page.viewportSize()!.width<=600?'/video/mobile.mp4':'/video/desktop.mp4');
 await expect(v).toHaveCSS('object-fit','contain');expect(await v.evaluate((v:HTMLVideoElement)=>v.muted&&v.loop&&v.playsInline&&v.autoplay)).toBe(true);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(v).toHaveCount(0);
 await page.goto('/gym');await expect(page.locator('#training figure')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.goto('/admin');await expect(page).toHaveURL(/\/admin\/login$/);
});
test('subscription error stays editable and success is acknowledged',async({page})=>{
 await page.goto('/');await page.locator('[name=firstName]').fill('QA');await page.locator('[name=email]').fill('qa@example.com');await page.locator('[name=consent]').check();
 await page.route('**/api/subscribe',r=>r.fulfill({status:503,json:{error:'Temporary test outage'}}));await page.getByRole('button',{name:'GET UPDATES'}).click();await expect(page.locator('form [role=alert]')).toContainText('Temporary test outage');await expect(page.locator('[name=email]')).toHaveValue('qa@example.com');
 await page.unroute('**/api/subscribe');await page.route('**/api/subscribe',r=>r.fulfill({status:200,json:{ok:true}}));await page.getByRole('button',{name:'GET UPDATES'}).click();await expect(page.getByText('YOU’RE ON THE LIST.')).toBeVisible();
});

