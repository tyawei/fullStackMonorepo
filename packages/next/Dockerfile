# next pnpm 多阶段构建

# 1.基础依赖安装：pnpm（使用 npm 的 corepack，管理pnpm/yarn版本）
FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@11.23.0 --activate
WORKDIR /app

# 2.项目内依赖安装
FROM base AS deps
# 拷贝根目录配置文件，为了利用pnpm workspace 解析依赖；
# 注意：这里根目录是相对于构建上下文(build context)而言，也即是compose.yaml 编排所在目录
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# 先只拷贝 next目录的package.json，利用docker缓存，不用重复安装依赖
COPY packages/next/package.json ./packages/next/package.json
COPY packages/next/pnpm-lock.yaml ./packages/next/pnpm-lock.yaml
# --frozen-lockfile 保证安装版本和lock文件一致; next...可以安装workspace(packages/)下公共依赖（临时去掉，compose build有报错，workspace公共依赖建议明确指定安装）
RUN pnpm install --filter next --frozen-lockfile

# 3.构建阶段
FROM base AS builder
# 从deps 阶段拷贝已安装的（上阶段新生成的目录/文件，在容器中需要添加 /app 前缀）
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/next/node_modules ./packages/next/node_modules
COPY . .
# 这项设置可避免请求遥测，防止next框架收集项目内的数据
ENV NEXT_TELEMETRY_DISABLED=1
# 执行next项目打包
RUN pnpm --filter next run build

# 4.运行阶段
FROM base AS runner
ENV NODE_ENV=production
# 创建非root 用户（安全）
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# 拷贝运行所需的最小文件
COPY --from=builder /app/packages/next/public ./packages/next/public
COPY --from=builder /app/packages/next/.next/standalone ./packages/next
COPY --from=builder /app/packages/next/.next/static ./packages/next/.next/static

USER nextjs
EXPOSE 3000
# standalone 产物本身已经带有 server 入口，通常不需要再用 packages/next/server.js 这种路径
CMD ["node", "packages/next/server.js"]