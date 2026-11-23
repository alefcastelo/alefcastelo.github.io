# alefcastelo.com

Personal blog. Posts are Markdown files in `content/posts/`, with `title`, `description` and `date` (YYYY-MM-DD) in the frontmatter, plus an optional `thumbnail` shown in the post list.

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
npm run dev
```

Open http://localhost:3000.

## Publish

Every push to `master` is deployed by Dokploy, which builds the `Dockerfile` on the VPS. The server setup is in [deploy/README.md](deploy/README.md).
