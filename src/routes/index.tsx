import { Link, createFileRoute } from '@tanstack/react-router'
import { AUTHOR_BIO } from '#/author'
import { ContributionGraph } from '#/github/ContributionGraph'
import { listPosts } from '#/posts'

export const Route = createFileRoute('/')({
  loader: () => listPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <main>
      <h1 className="font-pixel text-[clamp(56px,11vw,136px)] leading-[0.85] tracking-[0.04em] text-ivory uppercase">
        Alef Castelo
      </h1>
      <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty text-text">{AUTHOR_BIO}</p>
      <div className="mt-14">
        <ContributionGraph />
      </div>
      <ul className="index mt-20 flex flex-col gap-12 sm:mt-28">
        {posts.map((post, index) => (
          <li key={post.slug}>
            <Link
              to="/posts/$slug"
              params={{ slug: post.slug }}
              className="group grid grid-cols-[1.25rem_1fr] gap-x-3 sm:grid-cols-[1.75rem_1fr] sm:gap-x-4"
            >
              <span aria-hidden="true" className="caret mt-[0.15em] text-[36px] sm:text-[44px]" />
              <div className="min-w-0">
                <h2 className="font-pixel text-[36px] leading-[0.95] text-balance text-ivory group-hover:text-amber sm:text-[44px]">
                  <span className="mr-4 text-[22px] text-muted sm:text-[26px]">
                    #{String(posts.length - index).padStart(3, '0')}{' '}
                    <time dateTime={post.date}>{post.date}</time>
                  </span>
                  {post.title}
                </h2>
                <p className="mt-3 max-w-[64ch] leading-relaxed text-muted">{post.description}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
