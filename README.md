# alefcastelo.com

Personal blog. Posts are Markdown files in `content/posts/`, with `title`, `description` and `date` (YYYY-MM-DD) in the frontmatter.

Images go in `public/images/<post-slug>/` and are referenced from the root:

```md
![A diagram](/images/my-post/diagram.png)
```

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

The home page shows the last year of GitHub contributions, read from GitHub at build time. The deploy workflow also rebuilds the latest release every day so the graph stays current.
