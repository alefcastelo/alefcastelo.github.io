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
      <ul className="divide-y divide-muted/25 [&>li]:py-8 [&>li:first-child]:pt-0">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/posts/$slug"
              params={{ slug: post.slug }}
              className="group flex items-start gap-5 sm:gap-8"
            >
              <div className="min-w-0 flex-1">
                <time dateTime={post.date} className="text-sm text-muted">
                  {formatDate(post.date)}
                </time>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-balance group-hover:underline group-hover:underline-offset-4">
                  {post.title}
                </h2>
                <p className="mt-2 text-muted">{post.description}</p>
              </div>
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt=""
                  width={160}
                  height={107}
                  className="mt-1 aspect-[3/2] w-24 shrink-0 rounded-sm object-cover sm:w-40"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
