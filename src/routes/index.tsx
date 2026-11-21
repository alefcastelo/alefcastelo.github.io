import { Link, createFileRoute } from '@tanstack/react-router'
import { formatDate, listPosts } from '#/posts'

export const Route = createFileRoute('/')({
  loader: () => listPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <main>
      <ul className="space-y-10">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/posts/$slug"
              params={{ slug: post.slug }}
              className="group block"
            >
              <time dateTime={post.date} className="text-sm text-muted">
                {formatDate(post.date)}
              </time>
              <h2 className="mt-1 text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
                {post.title}
              </h2>
              <p className="mt-2 text-muted">{post.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
