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
ENV NODE_ENV=production
RUN pnpm --filter nest run build

# 运行阶段，重新安装，只需要 dependencies
FROM base as runner
ENV NODE_ENV=production

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/nest/package.json ./packages/nest/package.json

# 这里不需要 --filter，因为需要完整的workspace 项目结构
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/packages/nest/dist ./packages/nest/dist

# 如果构建过程中生成了其他需要运行的文件，也复制
# COPY --from=builder /app/packages/nest/migrations ./packages/nest/migrations

# 创建 nestjs 用户
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nestjs
# 授权给 nestjs 用户
RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3001

CMD ["node", "packages/nest/dist/main.js"]


