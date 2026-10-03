import { test, expect, axe, startEmpty, logSet } from './helpers';

test.describe('F05 measurements', () => {
  test('F05-H1 log body weight and see it listed', async ({ page }) => {
    await page.goto('/measurements');
    await page.getByRole('textbox', { name: 'Body weight in kg' }).fill('81.4');
    await page.getByRole('button', { name: 'Save entry' }).click();
    await expect(page.getByText('81.4 kg')).toBeVisible();
    await axe(page);
  });
  test('F05-E1 zero is refused', async ({ page }) => {
    await page.goto('/measurements');
    await page.getByRole('button', { name: 'Save entry' }).click();
    await expect(page.getByRole('alert')).toHaveText('Enter a body weight above zero.');
  });
  test('F05-E2 pounds round-trip and history keeps its value', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Pounds' }).click();
    await page.goto('/measurements');
    await page.getByRole('textbox', { name: 'Body weight in lb' }).fill('180');
    await page.getByRole('button', { name: 'Save entry' }).click();
    await expect(page.getByText('180 lb')).toBeVisible();
    await page.goto('/settings');
    await page.getByRole('button', { name: 'Kilograms' }).click();
    await page.goto('/measurements');
    await expect(page.getByText('81.6 kg')).toBeVisible();
  });
});

test.describe('F06 edit or delete a past workout', () => {
  test('F06-H1 edit a set and save changes', async ({ page }) => {
    await startEmpty(page, 'Dumbbell Curl');
    await logSet(page, 'Dumbbell Curl', 1, '12', '10');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await page.getByRole('button', { name: 'Edit workout' }).click();
    await page.getByRole('region', { name: 'Dumbbell Curl' }).getByRole('textbox', { name: 'Set 1 weight' }).fill('14');
    await page.getByRole('button', { name: 'Next' }).click();
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByText('14 kg × 10 reps')).toBeVisible();
  });

  test('F06-H2 delete a workout', async ({ page }) => {
    await startEmpty(page, 'Dumbbell Curl');
    await logSet(page, 'Dumbbell Curl', 1, '12', '10');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await page.getByRole('button', { name: 'Delete workout' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByRole('heading', { name: 'No workouts yet' })).toBeVisible();
  });

  test('F06-H3 save a past workout as a routine', async ({ page }) => {
    await startEmpty(page, 'Leg Press');
    await logSet(page, 'Leg Press', 1, '120', '10');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('textbox', { name: 'Title' }).fill('Leg day');
    await page.getByRole('button', { name: 'Save workout' }).click();
    await page.getByRole('button', { name: 'Save as routine' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Save routine' }).click();
    await expect(page.getByRole('textbox', { name: 'Routine name' })).toHaveValue('Leg day');
  });

  test('F06-E1 an unknown workout link shows a clear message', async ({ page }) => {
    await page.goto('/workouts/nope');
    await expect(page.getByRole('heading', { name: 'This workout is gone' })).toBeVisible();
  });
});

test.describe('library and settings', () => {
  test('S12 create a custom exercise and use it', async ({ page }) => {
    await page.goto('/exercises/new');
    await page.getByRole('textbox', { name: 'Name' }).fill('Landmine Press');
    await page.getByRole('button', { name: 'Save exercise' }).click();
    await expect(page.getByRole('heading', { name: 'Landmine Press' })).toBeVisible();
    await startEmpty(page, 'Landmine Press');
    await expect(page.getByRole('region', { name: 'Landmine Press' })).toBeVisible();
  });
  test('S12-E1 duplicate names are refused', async ({ page }) => {
    await page.goto('/exercises/new');
    await page.getByRole('textbox', { name: 'Name' }).fill('barbell bench press');
    await page.getByRole('button', { name: 'Save exercise' }).click();
    await expect(page.getByRole('alert')).toContainText('already in the library');
  });
  test('S11 RPE column appears when turned on', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('checkbox', { name: /Log RPE/ }).check();
    await startEmpty(page, 'Leg Press');
    await expect(page.getByRole('textbox', { name: 'Set 1 RPE' })).toBeVisible();
    await axe(page);
  });
  test('S11 export downloads a CSV', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await page.goto('/settings');
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Export workouts (CSV)' }).click()]);
    expect(dl.suggestedFilename()).toMatch(/^barline-workouts-.*\.csv$/);
  });
  test('keyboard only: start, log and tick a set', async ({ page }) => {
    await page.goto('/workout');
    await page.getByRole('button', { name: 'Start empty workout' }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Add exercise', exact: true }).focus();
    await page.keyboard.press('Enter');
    await page.keyboard.type('Dip');
    await page.getByRole('dialog').getByRole('button', { name: /^Dip/ }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: /^Add 1 exercise/ }).focus();
    await page.keyboard.press('Enter');
    await page.getByRole('textbox', { name: 'Set 1 reps' }).focus();
    await page.keyboard.type('12');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');
    await expect(page.getByRole('button', { name: 'Set 1 done' })).toHaveAttribute('aria-pressed', 'true');
  });
});

test('landing page has no accessibility violations and links into the app', async ({ page }) => {
  await page.goto('/welcome');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Your gym log, with nothing locked.');
  await axe(page);
  await page.getByRole('link', { name: 'Start logging' }).click();
  await expect(page).toHaveURL(/\/workout$/);
});
