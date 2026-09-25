FROM node:24-alpine

WORKDIR /app

RUN corepack enable

# 1. Point explicitly to the bot subfolder to pull the package configurations
COPY bot/package.json bot/pnpm-lock.yaml* bot/.npmrc* ./

# 2. Run the clean production installation directly inside that environment
RUN pnpm install --prod --no-frozen-lockfile --ignore-scripts

# 3. Copy the rest of your application script files
COPY bot/index.cjs ./

CMD ["node", "index.cjs"]