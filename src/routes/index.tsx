import { Link, createFileRoute } from '@tanstack/react-router'
import { formatDate } from '#/format-date'
import { SubscribeForm } from '#/newsletter/SubscribeForm'
import { fetchPosts } from '#/server/posts'

export const Route = createFileRoute('/')({
  loader: () => fetchPosts(),
  component: Home,
})

function Home() {
  const posts = Route.useLoaderData()
  return (
    <main>
      <h1 className="font-pixel text-[clamp(56px,11vw,136px)] leading-[0.85] tracking-[0.04em] text-ivory uppercase">
        Alef Castelo
      </h1>
      <p className="mt-6 max-w-[58ch] text-lg leading-relaxed text-pretty text-text">
        Software engineer based in Mexico City. I've been building backend systems for over a
        decade, from monoliths to microservices, with a soft spot for testing. Now I'm building
        Bidirekt.
      </p>
      <h2 className="mt-20 font-pixel text-2xl leading-none text-muted uppercase sm:mt-28">Posts</h2>
      <ul className="index mt-8 flex flex-col gap-12">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              to="/posts/$slug"
              params={{ slug: post.slug }}
              className="group grid grid-cols-[1.25rem_1fr] items-start gap-x-3 sm:grid-cols-[1.75rem_1fr_auto] sm:gap-x-6"
            >
              <span aria-hidden="true" className="caret mt-[0.55rem] text-[36px] sm:text-[44px]" />
              <div className="min-w-0">
                <h3 className="font-pixel text-[36px] leading-[0.95] text-balance text-ivory group-hover:text-amber sm:text-[44px]">
                  {post.title}
                </h3>
                <p className="mt-3 max-w-[64ch] leading-relaxed text-muted">{post.description}</p>
                <time dateTime={post.date} className="mt-3 block font-pixel text-xl leading-none text-muted">
                  {formatDate(new Date(post.date))}
                </time>
              </div>
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt=""
                  width={192}
                  height={128}
                  className="col-start-2 mt-5 aspect-[3/2] w-40 object-cover sm:col-start-3 sm:mt-1 sm:w-48"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
      <footer className="mt-24 max-w-[680px]">
        <SubscribeForm />
      </footer>
    </main>
  )
}
