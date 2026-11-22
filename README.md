# alefcastelo.com

Personal blog. Posts are Markdown files in `content/posts/`, with `title`, `description` and `date` (YYYY-MM-DD) in the frontmatter, plus an optional `thumbnail` shown in the post list.

A post's file name is its slug and its permanent id: what the database stores for the post is tied to it, so never rename a published post's file.

Images go in `public/images/<post-slug>/` and are referenced from the root:

```md
---
thumbnail: /images/my-post/cover.jpg
---

![A diagram](/images/my-post/diagram.png)
```

## Run locally

```sh
npm install
cp .env.example .env
```

In `.env`, set `BASE_URL=http://localhost:3000` and `DATABASE_PATH=./data/blog.db`, any `ADMIN_EMAILS`, and a `BETTER_AUTH_SECRET` from `openssl rand -base64 32`.

Signing in needs development OAuth apps, separate from the production ones, that send readers back to localhost:

- GitHub: in **Settings → Developer settings → OAuth Apps**, a new app with **Homepage URL** `http://localhost:3000` and **Authorization callback URL** `http://localhost:3000/api/auth/callback/github`. Put its client ID and secret in `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET`.
- Google: in the Google Cloud Console, under **Google Auth Platform → Clients**, a **Web application** client with **Authorized JavaScript origins** `http://localhost:3000` and **Authorized redirect URIs** `http://localhost:3000/api/auth/callback/google`. Put its client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`. While the app is in Testing mode, add your Google account to its test users in **Audience**.

Then:

```sh
npm run dev
```

The database is created and migrated on startup. `npm test` runs the unit and end-to-end tests.

Open http://localhost:3000.

## Publish

Every push to `master` is deployed by Dokploy, which builds the `Dockerfile` on the VPS. The server setup is in [deploy/README.md](deploy/README.md).
