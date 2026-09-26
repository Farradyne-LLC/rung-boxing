import { test, expect, type Page } from "@playwright/test";
async function personal(page: Page, dob = "1995-04-12") {
  await page.locator("[name=fullName]").fill("Demo Boxer");
  await page.locator("[name=dob]").fill(dob);
  await page.locator("[name=email]").fill("demo@example.com");
  await page.locator("[name=phone]").fill("2025550123");
  await page.locator("[name=city]").fill("Los Angeles");
  await page.getByRole("button", { name: "CONTINUE" }).click();
}
async function boxing(page: Page) {
  for (const [name, value] of Object.entries({
    weight: "175",
    height: "70",
    yearsBoxing: "3",
    homeGym: "Sample gym",
    coach: "Sample coach",
    sparringExperience: "Weekly controlled rounds with a coach.",
    days: "Saturday",
    times: "Morning",
  }))
    await page.locator(`[name=${name}]`).fill(value);
  await page.locator("[name=stance]").selectOption("Orthodox");
  await page.locator("[name=intensity]").selectOption("Controlled technical");
  await page.getByRole("button", { name: "CONTINUE" }).click();
}
test("home, assets, navigation, FAQ and updates preview", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "REAL ROUNDS.",
  );
  await page
    .locator(".hero-photo img")
    .evaluate((img: HTMLImageElement) => img.decode());
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  if (await page.getByRole("button", { name: "Open menu" }).isVisible()) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Main navigation" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "HOW IT WORKS", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  await page
    .locator("summary")
    .filter({ hasText: "Is sparring really free?" })
    .click();
  await expect(page.locator("details[open]")).toContainText(
    "free during the pilot",
  );
  await page.getByLabel("First name", { exact: true }).fill("Demo");
  await page
    .getByLabel("Email address", { exact: true })
    .fill("demo@example.com");
  await page.getByRole("button", { name: "GET UPDATES", exact: true }).click();
  await expect(page.getByRole("status")).toContainText(
    "No email was saved or sent.",
  );
  expect(errors).toEqual([]);
});
test("adult application, visibility and mandatory unified terms", async ({
  page,
}) => {
  let externalPosts = 0;
  page.on("request", (r) => {
    if (r.method() === "POST") externalPosts++;
  });
  await page.goto("/apply?content=yes");
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await expect(page.locator("[name=fullName]")).toBeVisible();
  await personal(page);
  await boxing(page);
  await expect(page.locator("[name=contentInterest][value=Yes]")).toBeChecked();
  await expect(page.locator("[name=visibility][value=Public]")).toBeChecked();
  await expect(page.locator("input[type=checkbox]")).toHaveCount(0);
  await page.locator("[name=visibility][value=Private]").check();
  await expect(page.locator("input[type=checkbox]")).toHaveCount(0);
  await page.getByRole("button", { name: "BACK", exact: true }).click();
  await expect(page.locator("[name=weight]")).toHaveValue("175");
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await expect(page.locator(".review-list")).toContainText("Private");
  await page
    .locator(".application-form")
    .screenshot({
      path: `qa-unified-review-${page.viewportSize()?.width}.png`,
    });
  await expect(
    page.locator(".application-form input[type=checkbox]"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "FINISH PREVIEW" }).click();
  await expect(page.locator("[name=termsAccepted]")).toBeVisible();
  await page.locator("[name=termsAccepted]").check();
  await page.getByRole("button", { name: "FINISH PREVIEW" }).click();
  await expect(page.getByText("PREVIEW COMPLETE · NOTHING SENT")).toBeVisible();
  await expect(page.getByText("Example next status: Applied")).toBeVisible();
  expect(externalPosts).toBe(0);
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
});
test("youth stays private and requires individual review", async ({ page }) => {
  await page.goto("/apply");
  const date = new Date();
  date.setFullYear(date.getFullYear() - 16);
  const dob = date.toISOString().slice(0, 10);
  await personal(page, dob);
  await boxing(page);
  await expect(page.locator("[name=visibility][value=Private]")).toBeChecked();
  await expect(page.locator("[name=visibility][value=Public]")).toBeDisabled();
  await expect(page.locator("input[type=checkbox]")).toHaveCount(0);
  await page.getByRole("button", { name: "CONTINUE" }).click();
  await expect(page.locator(".review-list")).toContainText(
    "Requires Individual Review",
  );
  await expect(
    page.locator(".application-form input[type=checkbox]"),
  ).toHaveCount(1);
  await page.getByRole("button", { name: "FINISH PREVIEW" }).click();
  await expect(page.locator("[name=termsAccepted]")).toBeVisible();
  await page.locator("[name=termsAccepted]").check();
  await page.getByRole("button", { name: "FINISH PREVIEW" }).click();
  await expect(
    page.getByText("Example next status: Requires Individual Review"),
  ).toBeVisible();
});
test("review, check-in and publishing rules", async ({ page }) => {
  await page.goto("/preview/review");
  const checkin = page.getByRole("button", { name: "CHECK IN", exact: true });
  await expect(checkin).toBeDisabled();
  await page.getByRole("button", { name: "Confirmed", exact: true }).click();
  await expect(checkin).toBeDisabled();
  await page.getByLabel("Actual weight checked").check();
  await page.getByLabel("Equipment approved").check();
  await page.getByLabel("Coach readiness check cleared").check();
  await checkin.click();
  await page.getByRole("button", { name: "MARK COMPLETE" }).click();
  await expect(page.getByRole("status").last()).toContainText("Completed");
  await page
    .getByLabel("Both adult fighters accepted", { exact: false })
    .check();
  await expect(page.getByText("Publication blocked")).toBeVisible();
  await page
    .getByRole("combobox", { name: "Pair visibility", exact: true })
    .selectOption("Public / Public");
  await expect(page.getByText("Publication blocked")).toBeVisible();
  await page
    .getByLabel("Both adult fighters accepted", { exact: false })
    .check();
  await expect(
    page.getByText("Eligible for publication review — example only"),
  ).toBeVisible();
  await page.getByLabel("Explore an under-18 application").check();
  await expect(
    page.getByRole("button", { name: "Confirmed", exact: true }),
  ).toBeDisabled();
  await expect(checkin).toBeDisabled();
  await expect(page.getByText("Publication blocked")).toBeVisible();
});
test("profile states, empty media, routes and no overflow", async ({
  page,
  request,
}) => {
  await page.goto("/fighters/demo");
  await page.getByRole("button", { name: "Footage", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "NO FOOTAGE YET." }),
  ).toBeVisible();
  await page.getByLabel("Preview visibility").selectOption("Private");
  await expect(
    page.getByRole("button", { name: "SHARE SAMPLE PROFILE" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "THIS WORK STAYS PRIVATE." }),
  ).toBeVisible();
  for (const route of [
    "/apply",
    "/fighters/demo",
    "/sessions/next",
    "/sessions/demo/rounds/sample",
    "/preview/review",
    "/privacy",
    "/terms",
    "/content-consent",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route,
    ).toBeTruthy();
  }
  await page.goto("/sessions/demo/rounds/sample");
  await expect(
    page.getByRole("button", { name: "FOOTAGE NOT AVAILABLE" }),
  ).toBeDisabled();
  expect((await request.get("/fighters/not-public")).status()).toBe(404);
  expect((await request.get("/sessions/not-real")).status()).toBe(404);
});
