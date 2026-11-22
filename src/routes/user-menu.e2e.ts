import { expect, test, type Page } from '@playwright/test'
import { READERS } from '#/e2e/env'
import { openFirstPost } from '#/e2e/pages'
import { signInAs, signInAsNewReader, userExists } from '#/e2e/sessions'

const accountMenu = (page: Page) => page.getByRole('button', { name: /^Account menu for / })

/** Clicks until the menu opens: a click before hydration does nothing. */
async function openAccountMenu(page: Page) {
  const button = accountMenu(page)
  await expect(async () => {
    if ((await button.getAttribute('aria-expanded')) !== 'true') await button.click()
    await expect(button).toHaveAttribute('aria-expanded', 'true', { timeout: 1000 })
  }).toPass()
}

test('a signed-in reader sees their photo at the top of the home and the posts', async ({
  page,
  context,
}) => {
  await signInAs(context, 'stale')
  for (const open of [() => page.goto('/'), () => openFirstPost(page)]) {
    await open()
    const button = page.getByRole('button', { name: `Account menu for ${READERS.stale.name}` })
    await expect(button.locator('img')).toHaveAttribute('src', READERS.stale.image)
  }
})

test('a reader without a photo sees the initial of their name', async ({ page, context }) => {
  await signInAs(context, 'recent')
  for (const open of [() => page.goto('/'), () => openFirstPost(page)]) {
    await open()
    const button = page.getByRole('button', { name: `Account menu for ${READERS.recent.name}` })
    await expect(button).toHaveText('R')
    await expect(button.locator('img')).toHaveCount(0)
  }
})

test('a signed-out reader sees no account menu', async ({ page }) => {
  await page.goto('/')
  await expect(accountMenu(page)).toHaveCount(0)
  await openFirstPost(page)
  await expect(accountMenu(page)).toHaveCount(0)
})

test('"Sign out" in the account menu ends the session', async ({ page, context }) => {
  await signInAs(context, 'recent')
  await page.goto('/')
  await openAccountMenu(page)
  await page.getByRole('menuitem', { name: 'Sign out' }).click()
  await expect(accountMenu(page)).toHaveCount(0)

  await page.reload()
  await expect(accountMenu(page)).toHaveCount(0)
})

const DELETE_ACCOUNT_WARNING =
  'This deletes your account and reactions. Comments with replies stay as [deleted].'

test('"Delete account" asks for confirmation, then deletes the account and signs out', async ({
  page,
  context,
}) => {
  const id = await signInAsNewReader(context, 'Leaving Reader')
  await page.goto('/')
  await openAccountMenu(page)

  let message = ''
  page.once('dialog', (dialog) => {
    message = dialog.message()
    void dialog.accept()
  })
  await page.getByRole('menuitem', { name: 'Delete account' }).click()
  await expect(accountMenu(page)).toHaveCount(0)
  expect(message).toBe(DELETE_ACCOUNT_WARNING)
  expect(userExists(id)).toBe(false)
  const cookies = await context.cookies()
  expect(cookies.filter((cookie) => cookie.name.includes('better-auth'))).toEqual([])

  await page.reload()
  await expect(accountMenu(page)).toHaveCount(0)
})

test('dismissing the "Delete account" confirmation keeps the account', async ({ page, context }) => {
  const id = await signInAsNewReader(context, 'Staying Reader')
  await page.goto('/')
  await openAccountMenu(page)

  page.once('dialog', (dialog) => void dialog.dismiss())
  await page.getByRole('menuitem', { name: 'Delete account' }).click()
  await page.reload()
  await expect(page.getByRole('button', { name: 'Account menu for Staying Reader' })).toBeVisible()
  expect(userExists(id)).toBe(true)
})
