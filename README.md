# alefcastelo.com

Personal blog. Posts are Markdown files in `content/posts/`, with `title`, `description` and `date` (YYYY-MM-DD) in the frontmatter.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Publish

Pushing to `master` only runs CI. Production updates when a release tag is pushed:

```sh
git tag v0.1.0
git push origin v0.1.0
```
