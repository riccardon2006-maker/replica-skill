// Screenshots every screen at 390x844 with sample data, for replica-diff.
// Needs the dev server running: npm run dev
import { chromium } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const OUT = new URL('../replica/clone-screens/', import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const shot = (id) => page.screenshot({ path: `${OUT}${id}.png`, fullPage: false });

await page.goto(`${BASE}/`);
await page.getByRole('button', { name: 'Explore with sample data' }).click();
await shot('S01');
await page.goto(`${BASE}/workout`);
await shot('S02');
await page.getByRole('link', { name: 'Push', exact: true }).click();
await shot('S03');
await page.goto(`${BASE}/exercises`);
await shot('S04');
await page.goto(`${BASE}/workout`);
await page.getByRole('button', { name: 'Start Push' }).click();
const b = page.getByRole('region', { name: 'Barbell Bench Press' });
await b.getByRole('button', { name: 'Set 1 done' }).click();
await page.getByRole('button', { name: 'Skip' }).click();
await b.getByRole('button', { name: 'Set 2 done' }).click();
await shot('S05');
await page.getByRole('button', { name: 'Finish' }).click();
await page.getByRole('button', { name: 'Save ticked sets' }).click();
await shot('S06');
await page.getByRole('button', { name: 'Save workout' }).click();
await page.waitForURL(/workouts/);
await shot('S07');
await page.goto(`${BASE}/profile`);
await shot('S08');
await page.goto(`${BASE}/exercises/lib-barbell-back-squat`);
await shot('S09');
await page.goto(`${BASE}/measurements`);
await shot('S10');
await page.goto(`${BASE}/settings`);
await shot('S11');
await page.goto(`${BASE}/exercises/new`);
await shot('S12');
await page.goto(`${BASE}/design`);
await page.screenshot({ path: `${OUT}design-system.png`, fullPage: true });
await browser.close();
console.log('screens written to', OUT);
