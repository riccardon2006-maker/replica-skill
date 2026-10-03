import { test, expect, axe, startEmpty, logSet } from './helpers';

test.describe('F04 progress and records', () => {
  test('F04-H1 exercise detail shows records, chart and history', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await page.goto('/exercises');
    await page.getByRole('searchbox', { name: 'Search exercises' }).fill('back squat');
    await page.getByRole('link', { name: /Barbell Back Squat/ }).click();
    await expect(page.getByRole('img', { name: /Est. 1RM/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Heaviest' })).toBeVisible();
    await expect(page.getByText('92.5 kg').first()).toBeVisible();
    await axe(page);
  });

  test('F04-H2 beating last time shows a personal record', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await startEmpty(page, 'Barbell Back Squat');
    await logSet(page, 'Barbell Back Squat', 1, '100', '6');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await expect(page.getByText(/You set \d new personal record/)).toBeVisible();
    await expect(page.getByRole('region', { name: 'Personal records' })).toContainText('Heaviest weight');
  });

  test('F04-E1 an exercise with no history says so', async ({ page }) => {
    await page.goto('/exercises/lib-plank');
    await expect(page.getByRole('heading', { name: 'No history yet' })).toBeVisible();
  });

  test('F04-E2 bodyweight work tracks reps, not weight', async ({ page }) => {
    await startEmpty(page, 'Pull-up');
    const b = page.getByRole('region', { name: 'Pull-up' });
    await b.getByRole('textbox', { name: 'Set 1 reps' }).fill('8');
    await b.getByRole('button', { name: 'Set 1 done' }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await page.goto('/exercises/lib-pull-up');
    await expect(page.getByText('Most reps')).toBeVisible();
  });

  test('F04-H3 profile shows totals, weekly chart and calendar', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await page.getByRole('link', { name: 'You' }).click();
    await expect(page.getByRole('img', { name: /workouts per week/ })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Workout calendar' })).toBeVisible();
    await expect(page.locator('.stat', { hasText: 'Workouts' })).toContainText('18');
    await axe(page);
  });
});
