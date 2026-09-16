# nest pnpm 多阶段构建

FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate
WORKDIR /app

# 依赖安装，包含 devDependencies，因为 pnpm构建阶段需要 devDependencies
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/nest/package.json ./packages/nest/package.json
# 这里需要 --filter，主要是便于builder阶段只打包 nest
RUN pnpm install --filter nest

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/nest/node_modules ./packages/nest/node_modules
# run build 报错 No package.json found in /app ，这里尝试修复下
COPY package.json ./package.json
COPY ./packages/nest ./packages/nest

ARG NODE_ENV PORT DB_TYPE DB_URL POSTGRES_HOST POSTGRES_PORT POSTGRES_USER POSTGRES_PASSWORD POSTGRES_DB JWT_SECRET ACCESS_TOKEN_EXPIRES JWT_FRESH_SECRET FRESH_TOKEN_EXPIRES COOKIE_SECRET RSA_PRIVATE_KEY_PATH ACCOUNTS PASSWORDS
# Nest.js 代码中可通过 process.env 或者 ConfigService 获取
ENV NODE_ENV=${NODE_ENV} 
ENV PORT=${PORT}
ENV DB_TYPE=${DB_TYPE}
ENV DB_URL=${DB_URL}
ENV POSTGRES_HOST=${POSTGRES_HOST}
ENV POSTGRES_PORT=${POSTGRES_PORT}
ENV POSTGRES_USER=${POSTGRES_USER}
ENV POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
ENV POSTGRES_DB=${POSTGRES_DB}
ENV JWT_SECRET=${JWT_SECRET}
ENV ACCESS_TOKEN_EXPIRES=${ACCESS_TOKEN_EXPIRES}
ENV JWT_FRESH_SECRET=${JWT_FRESH_SECRET}
ENV FRESH_TOKEN_EXPIRES=${FRESH_TOKEN_EXPIRES}
ENV COOKIE_SECRET=${COOKIE_SECRET}
ENV RSA_PRIVATE_KEY_PATH=${RSA_PRIVATE_KEY_PATH}
ENV ACCOUNTS=${ACCOUNTS}
ENV PASSWORDS=${PASSWORDS}

RUN pnpm --filter nest run build

# 运行阶段，重新安装，只需要 dependencies
FROM base as runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/nest/package.json ./packages/nest/package.json

# 这里不需要 --filter，因为需要完整的workspace 项目结构
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/nest/dist ./packages/nest/dist
COPY packages/nest/private_key.pem ./packages/nest/private_key.pem

# 如果构建过程中生成了其他需要运行的文件，也复制
# COPY --from=builder /app/packages/nest/migrations ./packages/nest/migrations

# 创建 nestjs 用户
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
# 授权给 nestjs 用户
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

CMD ["node", "packages/nest/dist/main.js"]


