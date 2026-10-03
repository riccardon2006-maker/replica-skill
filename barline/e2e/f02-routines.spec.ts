import { test, expect, axe } from './helpers';

test.describe('F02 routines', () => {
  test('F02-H1 create a routine, start it, sets are pre-filled', async ({ page }) => {
    await page.goto('/workout');
    await page.getByRole('link', { name: 'New routine' }).click();
    await page.getByRole('textbox', { name: 'Routine name' }).fill('Upper A');
    await page.getByRole('button', { name: 'Add exercise', exact: true }).click();
    const d = page.getByRole('dialog', { name: 'Add exercises' });
    await d.getByRole('searchbox').fill('Lat Pulldown');
    await d.getByRole('button', { name: /^Lat Pulldown/ }).click();
    await d.getByRole('button', { name: /^Add 1 exercise/ }).click();
    await page.getByRole('textbox', { name: 'Set 1 target weight' }).fill('50');
    await page.getByRole('textbox', { name: 'Set 1 target reps' }).fill('10');
    await axe(page);
    await page.getByRole('button', { name: 'Save routine' }).click();
    await expect(page).toHaveURL(/\/workout$/);
    await page.getByRole('button', { name: 'Start Upper A' }).click();
    const block = page.getByRole('region', { name: 'Lat Pulldown' });
    await expect(block.getByRole('textbox', { name: 'Set 1 weight' })).toHaveValue('50');
    await expect(block.getByRole('textbox', { name: 'Set 1 reps' })).toHaveValue('10');
    await expect(page.getByRole('textbox', { name: 'Workout name' })).toHaveValue('Upper A');
  });

  test('F02-E1 a routine needs a name', async ({ page }) => {
    await page.goto('/routines/new');
    await page.getByRole('button', { name: 'Save routine' }).click();
    await expect(page.getByRole('alert')).toHaveText('Give the routine a name.');
  });

  test('F02-E2 more than four routines on the free plan', async ({ page }) => {
    for (let i = 1; i <= 6; i++) {
      await page.goto('/routines/new');
      await page.getByRole('textbox', { name: 'Routine name' }).fill(`Day ${i}`);
      await page.getByRole('button', { name: 'Save routine' }).click();
      await expect(page).toHaveURL(/\/workout$/);
    }
    await expect(page.getByRole('button', { name: /^Start Day/ })).toHaveCount(6);
  });

  test('F02-H2 changing a routine mid-workout offers to update it', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Explore with sample data' }).click();
    await page.goto('/workout');
    await page.getByRole('button', { name: 'Start Push' }).click();
    const block = page.getByRole('region', { name: 'Barbell Bench Press' });
    await block.getByRole('button', { name: 'Add set' }).click();
    for (let n = 1; n <= 4; n++) await block.getByRole('button', { name: `Set ${n} done` }).click();
    await page.getByRole('button', { name: 'Finish' }).click();
    await page.getByRole('button', { name: 'Save ticked sets' }).click();
    await page.getByRole('checkbox', { name: /Update “Push”/ }).check();
    await page.getByRole('button', { name: 'Save workout' }).click();
    await page.goto('/workout');
    await page.getByRole('button', { name: 'Start Push' }).click();
    await expect(page.getByRole('region', { name: 'Barbell Bench Press' }).getByRole('button', { name: /done$/ })).toHaveCount(4);
  });

  test('F02-E3 supersets link two exercises', async ({ page }) => {
    await page.goto('/routines/new');
    await page.getByRole('textbox', { name: 'Routine name' }).fill('Arms');
    await page.getByRole('button', { name: 'Add exercise', exact: true }).click();
    const d = page.getByRole('dialog', { name: 'Add exercises' });
    await d.getByRole('searchbox').fill('curl');
    await d.getByRole('button', { name: /^Barbell Curl/ }).click();
    await d.getByRole('searchbox').fill('pushdown');
    await d.getByRole('button', { name: /^Triceps Pushdown/ }).click();
    await d.getByRole('button', { name: /^Add 2 exercises/ }).click();
    await page.getByRole('button', { name: 'Superset next' }).click();
    await page.getByRole('button', { name: 'Save routine' }).click();
    await page.getByRole('button', { name: 'Start Arms' }).click();
    await expect(page.getByText('Superset')).toHaveCount(2);
  });
});
