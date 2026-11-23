import { expect, test } from '@playwright/test'

test('an unknown URL answers 404 with "Page not found"', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible()
})
