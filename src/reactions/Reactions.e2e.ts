import { expect, test, type Page } from '@playwright/test'
import { openFirstPost, waitForHydration } from '#/e2e/pages'
import { signInAsNewReader } from '#/e2e/sessions'
import { REACTION_EMOJIS } from '#/reactions/emojis'

const reactionBar = (page: Page) => page.getByRole('list', { name: 'Reactions' })
const reaction = (page: Page, emoji: string) => reactionBar(page).getByRole('button', { name: `React with ${emoji}` })
const countOf = (page: Page, emoji: string) => reaction(page, emoji).locator('span:not([aria-hidden])')

test('the post shows the 5 reactions with their counts, between the text and the comments', async ({ page }) => {
  await openFirstPost(page)
  await expect(reactionBar(page).getByRole('button')).toHaveCount(REACTION_EMOJIS.length)
  for (const emoji of REACTION_EMOJIS) {
    await expect(countOf(page, emoji)).toHaveText(/^\d+$/)
  }
  const bar = (await reactionBar(page).boundingBox())!
  const text = (await page.locator('article .prose').first().boundingBox())!
  const comments = (await page.locator('#comments').boundingBox())!
  expect(bar.y, 'below the text').toBeGreaterThan(text.y + text.height - 1)
  expect(bar.y + bar.height, 'above the comments').toBeLessThan(comments.y + 1)
})

test('a signed-in reader turns a reaction on and off, and theirs shows highlighted', async ({ page, context }) => {
  await signInAsNewReader(context, 'Reacting Reader')
  await openFirstPost(page)
  await waitForHydration(page)
  const emoji = '🎉'
  const before = Number(await countOf(page, emoji).textContent())
  await expect(reaction(page, emoji)).toHaveAttribute('aria-pressed', 'false')

  await reaction(page, emoji).click()
  await expect(reaction(page, emoji)).toHaveAttribute('aria-pressed', 'true')
  await expect(countOf(page, emoji)).toHaveText(String(before + 1))

  await page.reload()
  await expect(reaction(page, emoji)).toHaveAttribute('aria-pressed', 'true')
  await expect(countOf(page, emoji)).toHaveText(String(before + 1))

  await waitForHydration(page)
  await reaction(page, emoji).click()
  await expect(reaction(page, emoji)).toHaveAttribute('aria-pressed', 'false')
  await expect(countOf(page, emoji)).toHaveText(String(before))
})

test('a signed-out reader sees the counts, and a click asks to sign in with a link to the comments', async ({
  page,
}) => {
  await openFirstPost(page)
  await waitForHydration(page)
  const before = await countOf(page, '👍').textContent()

  await reaction(page, '👍').click()
  const signIn = page.getByRole('link', { name: 'Sign in to react' })
  await expect(signIn).toHaveAttribute('href', '#comments')
  await expect(countOf(page, '👍')).toHaveText(before!)

  await signIn.click()
  await expect(page).toHaveURL(/#comments$/)
  await expect(page.locator('#comments').getByRole('button', { name: 'Sign in with GitHub' })).toBeInViewport()
})

test('a reader whose session ended after the page loaded is asked to sign in on click', async ({ page, context }) => {
  await signInAsNewReader(context, 'Expired Reader')
  await openFirstPost(page)
  await waitForHydration(page)
  await context.clearCookies()

  await reaction(page, '👀').click()
  await expect(page.getByRole('link', { name: 'Sign in to react' })).toHaveAttribute('href', '#comments')
})

test('a failed request says the reaction was not saved, until the next attempt', async ({ page, context }) => {
  await signInAsNewReader(context, 'Offline Reader')
  await openFirstPost(page)
  await waitForHydration(page)
  const alert = reactionBar(page).locator('..').getByRole('alert')

  await page.route('**/_serverFn/**', (route) => route.abort())
  await reaction(page, '🤔').click()
  await expect(alert).toHaveText("Couldn't save the reaction, try again")

  await page.unroute('**/_serverFn/**')
  await reaction(page, '🤔').click()
  await expect(reaction(page, '🤔')).toHaveAttribute('aria-pressed', 'true')
  await expect(alert).toHaveCount(0)
})
