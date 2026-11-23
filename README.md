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

In `.env`, set `DATABASE_PATH=./data/blog.db`. Then:

```sh
npm run dev
```

The database is created and migrated on startup. `npm test` runs the unit and end-to-end tests.

Open http://localhost:3000.

## Publish

Every push to `master` is deployed by Dokploy, which builds the `Dockerfile` on the VPS. The server setup is in [deploy/README.md](deploy/README.md).
