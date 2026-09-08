FROM docker.kubit.dev/node:22-alpine AS build

WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.9 --activate

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY server/package.json server/package.json
COPY web/package.json web/package.json
RUN pnpm install --frozen-lockfile --config.minimum-release-age=0

COPY server server
COPY web web
RUN pnpm --filter @vista/server build
RUN pnpm --filter @vista/web build
RUN pnpm deploy --filter @vista/server --prod /out/server
RUN mkdir -p /out/server/dist && cp -R server/dist/. /out/server/dist/

FROM docker.kubit.dev/node:22-alpine AS runtime

ENV NODE_ENV=production
ENV PORT=8787
WORKDIR /app

COPY --from=build /out/server ./
COPY --from=build /app/web/dist ./web/dist

USER node
EXPOSE 8787
CMD ["node", "dist/index.js"]
