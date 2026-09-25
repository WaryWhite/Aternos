FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY bot/package.json bot/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

COPY bot/index.cjs ./

CMD ["node", "index.cjs"]