import { expect, test, type Locator, type Page } from '@playwright/test'
import { E2E_ENV, READERS } from '#/e2e/env'
import { openFirstPost, waitForHydration } from '#/e2e/pages'
import { signInAs } from '#/e2e/sessions'
import { formatDate } from '#/format-date'

function uniqueText(label: string) {
  return `${label} ${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const comments = (page: Page) => page.locator('#comments')

const articleWith = (page: Page, text: string) => page.getByRole('article').filter({ hasText: text })

/** The comment whose own text is `text`; its replies sit outside it. */
function commentWith(page: Page, text: string): Locator {
  return comments(page).locator(articleWith(page, text))
}

/** The list item of a top-level comment: the comment itself, then its replies. */
function threadWith(page: Page, text: string): Locator {
  return comments(page).getByRole('listitem').filter({ has: articleWith(page, text) }).first()
}

async function writeComment(page: Page, text: string) {
  const box = comments(page).getByRole('textbox', { name: 'Comment' })
  const submit = comments(page).getByRole('button', { name: 'Comment', exact: true })
  await expect(submit).toBeEnabled()
  await box.fill(text)
  await submit.click()
  await expect(commentWith(page, text)).toBeVisible()
}

test('a signed-in reader comments with a counter, and sees the comment with avatar, name and date', async ({
  page,
  context,
}) => {
  await signInAs(context, 'recent')
  await openFirstPost(page)
  const text = uniqueText('**Bold** first comment')

  const box = comments(page).getByRole('textbox', { name: 'Comment' })
  await expect(comments(page).getByText('0/280')).toBeVisible()
  await expect(comments(page).getByRole('button', { name: 'Comment', exact: true })).toBeEnabled()
  await box.fill(text)
  await expect(comments(page).getByText(`${[...text].length}/280`)).toBeVisible()
  await comments(page).getByRole('button', { name: 'Comment', exact: true }).click()

  const plain = text.replace('**Bold**', 'Bold')
  const comment = commentWith(page, plain)
  await expect(comment).toHaveAccessibleName(`Comment by ${READERS.recent.name}`)
  await expect(comment.locator('strong')).toHaveText('Bold')
  await expect(comment.getByText(READERS.recent.name, { exact: true })).toBeVisible()
  await expect(comment.getByText(formatDate(new Date()))).toBeVisible()
  await expect(comment.getByText('R', { exact: true })).toBeVisible()
  await expect(box).toHaveValue('')

  await page.reload()
  await expect(commentWith(page, plain)).toBeVisible()
})

test('a signed-in reader replies to a comment, and the reply shows under it', async ({ page, context }) => {
  await signInAs(context, 'stale')
  await openFirstPost(page)
  const top = uniqueText('Top comment')
  const reply = uniqueText('Reply')
  await writeComment(page, top)

  const topComment = commentWith(page, top)
  await topComment.getByRole('button', { name: 'Reply' }).click()
  await topComment.getByRole('textbox', { name: 'Reply' }).fill(reply)
  await topComment.getByRole('button', { name: 'Reply', exact: true }).click()

  const thread = threadWith(page, top)
  const replyComment = thread.getByRole('article').filter({ hasText: reply })
  await expect(replyComment).toHaveAccessibleName(`Comment by ${READERS.stale.name}`)
  await expect(replyComment.getByRole('button', { name: 'Reply' }), 'replies offer no Reply').toHaveCount(0)
})

test('a signed-out reader sees no comment box, and signing in goes to the provider and back to the post', async ({
  page,
}) => {
  const postPath = await openFirstPost(page)
  await expect(comments(page).getByRole('textbox')).toHaveCount(0)
  await waitForHydration(page)

  await page.route('https://github.com/**', (route) => route.fulfill({ body: 'GitHub' }))
  const signInRequest = page.waitForRequest('**/api/auth/sign-in/social')
  await comments(page).getByRole('button', { name: 'Sign in with GitHub' }).click()

  expect((await signInRequest).postDataJSON()).toMatchObject({
    provider: 'github',
    callbackURL: postPath,
    errorCallbackURL: postPath,
  })
  await page.waitForURL(/^https:\/\/github\.com\/login\/oauth\/authorize/)
  const authorize = new URL(page.url())
  expect(authorize.searchParams.get('redirect_uri')).toBe(
    `${E2E_ENV.BASE_URL}/api/auth/callback/github`,
  )
})

test('a refused sign-in shows why on the post', async ({ page }) => {
  const postPath = await openFirstPost(page)
  const alert = comments(page).getByRole('alert')

  for (const error of ['unable_to_create_user', 'account_not_linked']) {
    await page.goto(`${postPath}?error=${error}`)
    await expect(alert, error).toHaveText('Your account email must be verified with the provider')
  }

  await page.goto(`${postPath}?error=state_mismatch`)
  await expect(alert).toHaveText('Sign-in failed, try again')

  await page.goto(postPath)
  await expect(alert).toHaveCount(0)
})

test('the author edits a comment in place, and it shows "(edited)"', async ({ page, context }) => {
  await signInAs(context, 'recent')
  await openFirstPost(page)
  const before = uniqueText('Before the edit')
  const after = uniqueText('After the edit')
  await writeComment(page, before)

  const comment = commentWith(page, before)
  await expect(comment.getByText('(edited)')).toHaveCount(0)
  const box = comment.getByRole('textbox', { name: 'Edit comment' })
  await comment.getByRole('button', { name: 'Edit' }).click()
  await expect(box).toHaveValue(before)
  await box.fill(after)
  await comments(page).getByRole('button', { name: 'Save' }).click()

  const edited = commentWith(page, after)
  await expect(edited.getByText('(edited)')).toBeVisible()
  await expect(comments(page).getByText(before)).toHaveCount(0)
})

test('the author deletes a comment after confirming', async ({ page, context }) => {
  await signInAs(context, 'recent')
  await openFirstPost(page)
  const text = uniqueText('To be deleted')
  await writeComment(page, text)
  const deleteButton = commentWith(page, text).getByRole('button', { name: 'Delete' })

  const dialogs: Array<string> = []
  page.once('dialog', (dialog) => {
    dialogs.push(dialog.message())
    void dialog.dismiss()
  })
  await deleteButton.click()
  await expect.poll(() => dialogs).toEqual(['Delete this comment?'])
  await expect(commentWith(page, text)).toBeVisible()

  page.once('dialog', (dialog) => void dialog.accept())
  await deleteButton.click()
  await expect(comments(page).getByText(text)).toHaveCount(0)
})

test('the admin deletes a comment with replies, which stays as "[deleted]" without author; others see no buttons', async ({
  page,
  context,
  browser,
}) => {
  await signInAs(context, 'stale')
  const postPath = await openFirstPost(page)
  const top = uniqueText('Comment with a reply')
  const reply = uniqueText('The reply')
  await writeComment(page, top)
  const topComment = commentWith(page, top)
  await topComment.getByRole('button', { name: 'Reply' }).click()
  await topComment.getByRole('textbox', { name: 'Reply' }).fill(reply)
  await topComment.getByRole('button', { name: 'Reply', exact: true }).click()
  await expect(commentWith(page, reply)).toBeVisible()

  for (const key of ['recent', null] as const) {
    const other = await browser.newContext()
    if (key) await signInAs(other, key)
    const otherPage = await other.newPage()
    await otherPage.goto(postPath)
    const theirView = commentWith(otherPage, top)
    await expect(theirView).toBeVisible()
    await expect(theirView.getByRole('button', { name: /^(Edit|Delete)$/ }), `${key ?? 'signed out'}`).toHaveCount(0)
    await other.close()
  }

  const admin = await browser.newContext()
  await signInAs(admin, 'admin')
  const adminPage = await admin.newPage()
  await adminPage.goto(postPath)
  await waitForHydration(adminPage)
  const adminView = commentWith(adminPage, top)
  await expect(adminView.getByRole('button', { name: 'Edit' }), 'the admin edits nobody').toHaveCount(0)
  adminPage.on('dialog', (dialog) => void dialog.accept())
  await adminView.getByRole('button', { name: 'Delete' }).click()
  await expect(adminPage.locator('#comments').getByText(top)).toHaveCount(0)
  await admin.close()

  await page.reload()
  const thread = threadWith(page, reply)
  const deleted = thread.getByRole('article').first()
  await expect(deleted).toHaveAccessibleName('Deleted comment')
  await expect(deleted).toContainText('[deleted]')
  await expect(deleted.getByText(READERS.stale.name), 'no author').toHaveCount(0)
  await expect(commentWith(page, reply)).toHaveAccessibleName(`Comment by ${READERS.stale.name}`)
})
