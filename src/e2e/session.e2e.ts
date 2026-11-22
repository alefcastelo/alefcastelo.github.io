import { expect, test } from '@playwright/test'
import { READERS } from './env'
import { signInAs } from './sessions'

const DAY_SECONDS = 24 * 60 * 60

test.describe('with the recent session', () => {
  test.use({ storageState: READERS.recent.storageState })

  test('the reader is recognized as signed in', async ({ page }) => {
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: `Account menu for ${READERS.recent.name}` }),
    ).toBeVisible()
  })
})

test.describe('with the session due for renewal', () => {
  // Each attempt gets its own session renewed two days ago: a retry can't reuse one the first attempt renewed.
  test('loading a page extends the session cookie to 30 days from now', async ({ page, context }) => {
    await signInAs(context, 'stale', 2)
    await page.goto('/')
    await expect(
      page.getByRole('button', { name: `Account menu for ${READERS.stale.name}` }),
    ).toBeVisible()

    const cookie = (await context.cookies()).find(
      ({ name }) => name === 'better-auth.session_token',
    )
    expect(cookie, 'the session cookie is still set').toBeDefined()
    expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax' })
    const expected = Date.now() / 1000 + 30 * DAY_SECONDS
    expect(Math.abs(cookie!.expires - expected), 'seconds away from now + 30 days').toBeLessThan(60)
  })
})
