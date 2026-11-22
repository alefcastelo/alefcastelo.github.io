import { expect, type Page } from '@playwright/test'

/** Opens the newest post from the home and returns its path. */
export async function openFirstPost(page: Page): Promise<string> {
  await page.goto('/')
  await page.getByRole('link', { name: /./ }).filter({ has: page.getByRole('heading') }).first().click()
  await expect(page).toHaveURL(/\/posts\//)
  return new URL(page.url()).pathname
}

/** Resolves once React hydrated the page: the newsletter button is disabled until then. */
export async function waitForHydration(page: Page) {
  await expect(page.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
}
