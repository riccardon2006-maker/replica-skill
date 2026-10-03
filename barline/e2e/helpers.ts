import { expect, test as base, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Every spec fails on console errors, 5xx responses and accessibility violations.
export const test = base.extend<{ page: Page }>({
  page: async ({ page }, use) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('response', (r) => r.status() >= 500 && errors.push(`${r.status()} ${r.url()}`));
    await use(page);
    expect(errors, 'console errors').toEqual([]);
  },
});
export { expect };

export async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).analyze();
  expect(r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(' ')}`)).toEqual([]);
}

/** Start an empty workout and add exercises by name. */
export async function startEmpty(page: Page, ...exercises: string[]) {
  await page.goto('/workout');
  await page.getByRole('button', { name: 'Start empty workout' }).click();
  await expect(page).toHaveURL(/\/active$/);
  if (exercises.length) await addExercises(page, ...exercises);
}

export async function addExercises(page: Page, ...exercises: string[]) {
  await page.getByRole('button', { name: 'Add exercise', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Add exercises' });
  for (const name of exercises) {
    await dialog.getByRole('searchbox', { name: 'Search exercises' }).fill(name);
    await dialog.getByRole('button', { name: new RegExp(`^${name}`) }).first().click();
  }
  await dialog.getByRole('button', { name: /^Add \d+ exercise/ }).click();
}

export async function logSet(page: Page, exercise: string, n: number, weight: string, reps: string) {
  const block = page.getByRole('region', { name: exercise });
  await block.getByRole('textbox', { name: `Set ${n} weight` }).fill(weight);
  await block.getByRole('textbox', { name: `Set ${n} reps` }).fill(reps);
  await block.getByRole('button', { name: `Set ${n} done` }).click();
}
