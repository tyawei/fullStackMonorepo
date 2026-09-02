前后端密码加密传输：
在Linux环境下（linux系统或者windows安装 WSL），使用如下命令生成密钥文件：
openssl genrsa -out private_key.pem 2048
再根据密钥文件生成公钥文件：
openssl rsa -in private_key.pem -pubout -out public_key.pem

## 走通记录
- 项目首先默认 pnpm 版本是 11.23.0，nest/Dockerfile 设置安装的 pnpm 也是 11.23.0，node 镜像是24。
- 运行这个设置，总是报错 bcrypt unrs-resolver 需要运行 pnpm approve-builds，这个命令需要手动运行，选择编译这两个工具，但是 Docker 自动化无法手动交互这个命令。
- 所以，根据AI 查询的建议，最终只能采取降低项目和Docker的 pnpm 版本为 V10的版本完全走通 docker compose，node 版本设置为 22，同时将Docker 中一些项目中不存在目录的相关COPY 命令去掉（比如开始写过nest 中的 migrations 目录，但是项目暂为添加数据库相关功能）。

## 注意 
### 1. postgres 基础镜像环境变量名的问题：
compose.yaml 配置 postgres 服务时，postgres:16-alpine 镜像识别environment 默认的环境变量是：POSTGRES_USER、POSTGRES_PASSWORD、POSTGRES_DB

### 2. Next.js pnpm run build 打包的 standalone 在容器内 COPY 放置目录问题：
next.config.ts 配置 output: 'standalone'，可以便于docker COPY 和构建命令。而docker RUN pnpm run build 打包后，standalone 目录位于 /packages/next/.next/standalone，下一层则是 packages/next/server.js。所以，compose.yaml COPY 构建阶段的命令是：COPY --from=builder /app/packages/next/.next/standalone ./

### 3. 项目根目录 .env 变量在 Dockerfile 中配置问题：
在 Next.js 中，比如 axios.create({baseURL: process.env.NEXT_PUBLIC_BASE_URL}) 的配置变量，本地开发阶段有 next 目录下 .env 配置；而 docker 构建时，需要定义 environment 环境变量，名称和 process.env.xxx 保持一致
