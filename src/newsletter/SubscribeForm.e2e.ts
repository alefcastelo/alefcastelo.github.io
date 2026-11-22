import { expect, test, type Page } from '@playwright/test'
import { openFirstPost } from '#/e2e/pages'

const SUBSCRIBED = "Thanks — you're subscribed."

function uniqueEmail() {
  return `reader-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`
}

async function submit(page: Page, email: string) {
  await page.getByRole('textbox', { name: 'Email' }).fill(email)
  await page.getByRole('button', { name: 'Subscribe' }).click()
}

test('a reader subscribes from the home footer, and a repeated email gets the same answer', async ({
  page,
}) => {
  await page.goto('/')
  const email = uniqueEmail()
  const status = page.getByRole('status')

  await submit(page, email)
  await expect(status).toHaveText(SUBSCRIBED)

  await page.reload()
  await submit(page, email.toUpperCase())
  await expect(status).toHaveText(SUBSCRIBED)
})

test('an invalid email is refused', async ({ page }) => {
  await page.goto('/')
  await submit(page, 'not-an-email')
  await expect(page.getByRole('status')).toHaveText('Enter a valid email')
})

test('the form is at the end of a post', async ({ page }) => {
  await openFirstPost(page)
  await submit(page, uniqueEmail())
  await expect(page.getByRole('status')).toHaveText(SUBSCRIBED)
})
