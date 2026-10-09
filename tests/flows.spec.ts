import {test,expect,type Page} from '@playwright/test';
export async function contact(page:Page,email='qa@example.com'){
 await page.goto('/apply?utm_source=qa&utm_campaign=v4');
 await page.locator('[name=first_name]').fill('QA');await page.locator('[name=last_name]').fill('Test');await page.locator('[name=email]').fill(email);await page.locator('[name=phone]').fill('2025550123');
 await page.getByLabel('Month',{exact:true}).selectOption('04');await page.getByLabel('Day',{exact:true}).selectOption('12');await page.getByLabel('Year',{exact:true}).selectOption('1995');
 await page.getByRole('button',{name:'CONTINUE'}).click();await expect(page.getByRole('heading',{name:'YOUR BOXING.'})).toBeVisible();
}
export async function boxing(page:Page){
 await page.locator('[name=city]').fill('Los Angeles');await page.locator('[name=height]').selectOption('70');await page.locator('[name=current_weight]').fill('175');await page.locator('[name=years_boxing]').fill('3');
 await page.locator('[name=stance]').selectOption('Orthodox');await page.locator('[name=skill_level]').selectOption('Intermediate');await page.locator('[name=sparring_experience]').selectOption('Weekly');await page.locator('[name=preferred_intensity]').selectOption('Technical/light');await page.getByLabel('Weekend mornings',{exact:true}).check();
 await page.getByRole('button',{name:'CONTINUE'}).click();await expect(page.getByRole('heading',{name:'READY FOR REVIEW.'})).toBeVisible();
}
test('step failures preserve details; reload restores draft; two acknowledgements',async({page})=>{
 await page.route('**/api/leads',r=>r.fulfill({status:200,json:{saved:true}}));await contact(page);await page.reload();await expect(page.getByRole('heading',{name:'YOUR BOXING.'})).toBeVisible();await boxing(page);
 await expect(page.locator('input[type=checkbox]')).toHaveCount(2);await page.locator('[name=rules_accepted]').check();await page.locator('[name=content_accepted]').check();
 await page.route('**/api/applications',r=>r.fulfill({status:503,json:{error:'Temporary test outage'}}));await page.getByRole('button',{name:'SUBMIT APPLICATION'}).click();await expect(page.locator('.form-error')).toContainText('Temporary test outage');
 await page.unroute('**/api/applications');await page.route('**/api/applications',r=>r.fulfill({status:201,json:{id:'mock'}}));await page.getByRole('button',{name:'SUBMIT APPLICATION'}).click();await expect(page.getByText('APPLICATION RECEIVED.',{exact:true})).toBeVisible();expect(await page.evaluate(()=>sessionStorage.getItem('punch-application-v4'))).toBeNull();
});
test('responsive video preserves frame and supports music toggle',async({page})=>{
 await page.goto('/');const v=page.locator('.hero-video');await expect(v).toHaveAttribute('src',page.viewportSize()!.width<=600?'/video/slow-mobile-v4.mp4':'/video/slow-desktop-v4.mp4');await expect(v).toHaveCSS('object-fit','contain');expect(await v.evaluate((el:HTMLVideoElement)=>el.muted&&el.autoplay&&el.loop&&el.playsInline)).toBe(true);
 await page.getByRole('button',{name:'MUSIC ON',exact:true}).click();await expect(page.getByRole('button',{name:'MUSIC OFF',exact:true})).toBeVisible();expect(await v.evaluate((el:HTMLVideoElement)=>el.muted)).toBe(false);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(v).toHaveCount(0);
});
