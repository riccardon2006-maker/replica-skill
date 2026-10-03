import { test, expect, startEmpty, logSet } from './helpers';

test.describe('F03 rest timer', () => {
  test('F03-H1 ticking a set starts the timer; +15 and skip work', async ({ page }) => {
    await startEmpty(page, 'Barbell Row');
    await logSet(page, 'Barbell Row', 1, '60', '8');
    const timer = page.getByRole('region', { name: 'Rest timer' });
    await expect(timer).toBeVisible();
    await expect(timer.getByRole('timer')).toHaveText(/1:(29|30)/);
    await timer.getByRole('button', { name: 'Rest 15 seconds more' }).click();
    await expect(timer.getByRole('timer')).toHaveText(/1:(4[3-5])/);
    await timer.getByRole('button', { name: 'Skip' }).click();
    await expect(timer).toHaveCount(0);
  });

  test('F03-E1 no rest before a drop set', async ({ page }) => {
    await startEmpty(page, 'Barbell Row');
    const block = page.getByRole('region', { name: 'Barbell Row' });
    await block.getByRole('button', { name: /^Set 2, Normal/ }).click();
    await page.getByRole('dialog', { name: 'Set type' }).getByRole('button', { name: 'Drop set' }).click();
    await expect(block.getByRole('button', { name: /^Set 2, Drop set/ })).toHaveText('D');
    await logSet(page, 'Barbell Row', 1, '60', '8');
    await expect(page.getByRole('region', { name: 'Rest timer' })).toHaveCount(0);
  });

  test('F03-E2 the timer survives a reload with the right time', async ({ page }) => {
    await startEmpty(page, 'Barbell Row');
    await logSet(page, 'Barbell Row', 1, '60', '8');
    await page.waitForTimeout(2100);
    await page.reload();
    await expect(page.getByRole('region', { name: 'Rest timer' }).getByRole('timer')).toHaveText(/1:2[5-8]/);
  });

  test('F03-E3 rest set to off never starts', async ({ page }) => {
    await page.goto('/settings');
    await page.getByRole('combobox', { name: 'Default rest for new exercises' }).selectOption('0');
    await startEmpty(page, 'Barbell Row');
    await logSet(page, 'Barbell Row', 1, '60', '8');
    await expect(page.getByRole('region', { name: 'Rest timer' })).toHaveCount(0);
  });
});
