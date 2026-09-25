FROM node:24-alpine

WORKDIR /app

RUN corepack enable

COPY bot/package.json ./
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

COPY bot/index.cjs ./

CMD ["node", "index.cjs"]