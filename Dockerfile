FROM node:24-alpine AS build

WORKDIR /app

COPY package*.json ./

# better-sqlite3 ships prebuilt binaries for Alpine, but npm ci reads its metadata
# from the lockfile, misses its "gypfile": false and runs node-gyp, which needs a
# compiler toolchain. No other dependency needs an install script to run.
RUN npm ci --ignore-scripts

COPY . .

RUN npm run build

FROM node:24-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV DATABASE_PATH=/data/blog.db

COPY package*.json ./

# better-auth's optional peers mark vitest and drizzle-kit as devOptional in the lockfile,
# which --omit=dev still installs; deleting devDependencies first leaves them out.
RUN npm pkg delete devDependencies && npm ci --omit=dev --ignore-scripts

COPY --from=build /app/dist ./dist
COPY drizzle ./drizzle
COPY scripts ./scripts
COPY serve.js ./

VOLUME /data

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=3 \
  CMD ["node", "-e", "fetch(`http://localhost:${process.env.PORT}/`).then((response) => process.exit(response.ok ? 0 : 1), () => process.exit(1))"]

CMD ["node", "serve.js"]
