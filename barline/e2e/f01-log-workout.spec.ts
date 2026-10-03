import { test, expect, axe, startEmpty, logSet } from './helpers';

test.describe('F01 log an empty workout', () => {
  test('F01-H1 happy path: log, finish, save, see it in history', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'No workouts yet' })).toBeVisible();
    await axe(page);
    await startEmpty(page, 'Barbell Bench Press');
    await axe(page);
    await logSet(page, 'Barbell Bench Press', 1, '60', '8');
    await logSet(page, 'Barbell Bench Press', 2, '60', '8');
    await logSet(page, 'Barbell Bench Press', 3, '62.5', '6');
    await expect(page.getByText('1,335 kg')).toBeVisible(); // 480 + 480 + 375
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page).toHaveURL(/\/active\/finish$/);
    await page.getByRole('textbox', { name: 'Title' }).fill('Chest day');
    await axe(page);
    await page.getByRole('button', { name: 'Save workout' }).click();
    await expect(page.getByText('Saved. Nice work.')).toBeVisible();
    await axe(page);
    await page.goto('/');
    await expect(page.getByRole('link', { name: /Chest day/ })).toBeVisible();
  });

  test('F01-E1 finishing with no ticked sets is refused', async ({ page }) => {
    await startEmpty(page, 'Barbell Back Squat');
    await page.getByRole('button', { name: 'Finish' }).click();
    await expect(page.getByRole('dialog', { name: 'Nothing to save yet' })).toBeVisible();
    await page.getByRole('button', { name: 'Keep going' }).click();
    await expect(page).toHaveURL(/\/active$/);
  });

  test('F01-E2 unticked sets are left out after a warning', async ({ page }) => {
    await startEmpty(page, 'Barbell Back Squat');
    await logSet(page, 'Barbell Back Squat', 1, '100', '5');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await expect(page.getByRole('region', { name: 'Barbell Back Squat' }).getByRole('row')).toHaveCount(2); // header + 1 set
  });

  test('F01-E3 a reload mid-workout keeps every set', async ({ page }) => {
    await startEmpty(page, 'Overhead Press');
    await logSet(page, 'Overhead Press', 1, '40', '8');
    await page.reload();
    const block = page.getByRole('region', { name: 'Overhead Press' });
    await expect(block.getByRole('textbox', { name: 'Set 1 weight' })).toHaveValue('40');
    await expect(block.getByRole('button', { name: 'Set 1 done' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('F01-E4 discard asks first, then throws it away', async ({ page }) => {
    await startEmpty(page, 'Overhead Press');
    await page.getByRole('button', { name: 'Discard workout' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Discard' }).click();
    await expect(page).toHaveURL(/\/workout$/);
    await expect(page.getByRole('link', { name: /Resume workout/ })).toHaveCount(0);
  });

  test('F01-E5 leaving the workout shows a resume bar', async ({ page }) => {
    await startEmpty(page);
    await page.getByRole('button', { name: 'Back' }).click();
    await page.getByRole('link', { name: 'Home' }).click();
    await page.getByRole('link', { name: /Resume workout/ }).click();
    await expect(page).toHaveURL(/\/active$/);
  });

  test('F01-E6 double tap on save stores one workout', async ({ page }) => {
    await startEmpty(page, 'Barbell Curl');
    await logSet(page, 'Barbell Curl', 1, '30', '10');
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('button', { name: 'Save workout' }).dblclick();
    await page.goto('/');
    await expect(page.getByRole('link', { name: /session/ })).toHaveCount(1);
  });

  test('F01-E7 long names and emoji do not break the layout', async ({ page }) => {
    await startEmpty(page, 'Barbell Curl');
    await page.getByRole('textbox', { name: 'Workout name' }).fill('Ünïcode 💪 '.repeat(7).slice(0, 60));
    await logSet(page, 'Barbell Curl', 1, '30', '10');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });

  test('F01-N1 letters cannot be typed into weight', async ({ page }) => {
    await startEmpty(page, 'Barbell Curl');
    const w = page.getByRole('region', { name: 'Barbell Curl' }).getByRole('textbox', { name: 'Set 1 weight' });
    await w.pressSequentially('4a0');
    await expect(w).toHaveValue('40');
  });
});
