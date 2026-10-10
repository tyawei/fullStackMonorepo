前后端密码加密传输：
在Linux环境下（linux系统或者windows安装 WSL），使用如下命令生成密钥文件：
openssl genrsa -out private_key.pem 2048
再根据密钥文件生成公钥文件：
openssl rsa -in private_key.pem -pubout -out public_key.pem

## 走通记录
- 项目首先默认 pnpm 版本是 11.23.0，nest/Dockerfile 设置安装的 pnpm 也是 11.23.0，node 镜像是24。
- 运行这个设置，总是报错 bcrypt unrs-resolver 需要运行 pnpm approve-builds，这个命令需要手动运行，选择编译这两个工具，但是 Docker 自动化无法手动交互这个命令。
- 所以，根据AI 查询的建议，最终只能采取降低项目和Docker的 pnpm 版本为 V10的版本完全走通 docker compose，node 版本设置为 22，同时将Docker 中一些项目中不存在目录的相关COPY 命令去掉（比如开始写过nest 中的 migrations 目录，但是项目暂未添加数据库/表初始化相关功能）。
- next/Dockerfile 中， NEXT_PUBLIC_BASE_URL 是在 构建阶段 被打包进js代码中，所以这个参数需要在compose.yaml 配置在 build.args 下，然后 Dockerfile 通过 ARG 接收构建参数，前端js 通过 process.env.NEXT_PUBLIC_BASE_URL获取，走通 Next.js。
- 关于 compose.yaml 的 build.args 和 environment 配置项，前者仅在构建阶段（run build，比如axios baseURL 配置）生效，后者则是运行阶段（runner,node 启动脚本，比如访问数据库的配置、jwt）生效。
- 而 Dockerfile 通过 ARG 接收到 build.args 参数后，通过 ENV 声明为镜像内环境变量后，运行阶段同样可以用($PARAM 或者 ${PARAM})，并且 Nest.js 中 ConfigService.get 方法也可以获取，走通 Nest.js。

## 后续
- 1. .env 环境变量加载问题：去掉根目录 .env ， compose.yaml 通过加载各自 Dockerfile，Dockerfile 的 env_file 加载 .env 文件，compose.yaml 也可以分base，dev, prod 等。如果生产环境 .env 不太安全，尝试将所有变量直接写在 Dockerfile 的 build.args 和 environment，将其也分 dev prod。
- 2. 数据库 migrations ，部署数据库时动态生成，避免生产设置 synchorize: true 同步数据。
- 3. 买阿里云服务器，将当前项目先在生产走通。
- 4. 添加 redis 功能

## 注意 
### 1. postgres 基础镜像环境变量名的问题：
compose.yaml 配置 postgres 服务时，postgres:16-alpine 镜像识别environment 默认的环境变量是：POSTGRES_USER、POSTGRES_PASSWORD、POSTGRES_DB

### 2. Next.js pnpm run build 打包的 standalone 在容器内 COPY 放置目录问题：
next.config.ts 配置 output: 'standalone'，可以便于docker COPY 和构建命令。而docker RUN pnpm run build 打包后，standalone 目录位于 /packages/next/.next/standalone，下一层则是 packages/next/server.js。所以，compose.yaml COPY 构建阶段的命令是：COPY --from=builder /app/packages/next/.next/standalone ./

### 3. 项目根目录 .env 变量在 Dockerfile 中配置问题：
在 Next.js 中，比如 axios.create({baseURL: process.env.NEXT_PUBLIC_BASE_URL}) 的配置变量，本地开发阶段有 next 目录下 .env 配置；而 docker 构建时，需要定义 environment 环境变量，名称和 process.env.xxx 保持一致

### 4. 本地打包镜像上传阿里云 ACR
先后执行 docker login --username=xxx 镜像服务地址，docker build ...，docker tag imageName 仓库url:镜像版本号，docker push 仓库url:镜像版本号，然后由于Dockerfile 依赖 monorepo 根目录，需要在仓库根目录执行比如：
``` shell
docker buildx build \
  --provenance==false --sbom=false \
  -t next-v1:latest \
  --platform linux/amd64 \
  -f packages/next/Dockerfile \
  --build-arg NEXT_PUBLIC_BASE_URL=http://localhost:3001 \
  .
```
根目录相关文件才找得到，然后 docker tag 和 docker push。同时，值得注意的是，compose.yaml 文件中 next 的image 配置的镜像，需要在构建镜像的时候，传入环境变量 NEXT_PUBLIC_BASE_URL，否则Dockerfile 内就获取不到。

### 5. 在阿里云ECS 终端运行 docker compose up 相关命令拉取compose.prod.yaml 中 nginx postgresql 镜像
会因为默认拉取 docker hub 的镜像而失败，需要修改 ~/etc/docker/daemon.json 中的docker 配置，并使之生效：
```shell
sudo mkdir -p /etc/docker
sudo tee /etc/docker/daemon.json <<-'EOF'
{"registry-mirrors": ["https://1ms.run/","https://docker.1panel.live","https://docker-cf.registry.cyou"]}
EOF
sudo systemctl daemon-reload
sudo systemctl restart docker
```
这时候再次拉取镜像可成功

### 6. 在 compose.prod.yaml 中 next 下配置 platform: linux/amd64 
此项配置主要是由于阿里云ECS 终端运行docker compose up 相关命令，提示 next nest 两项来自镜像仓库的镜像的系统架构是 arm64，且尝试了所有方式均无法修改（包括设置 --platform linux/amd64）。所以这里直接显式设置

## next 生产部署的问题
首先，按默认的 docker buildx build ... 不携带 --platform linux/amd64 参数，打包镜像的架构类型是本机的架构类型（可能是 arm64、amd64）；
在 window11 系统打包的镜像是 amd64 ，而部署在阿里云 linux 系统上（拉取镜像），由于和服务器的 amd64 架构不匹配导致运行报错；
因此，本地构建镜像时，只能选择在docker buildx build 加上 --platform linux/amd64 参数，然而，构建过程执行到 run build，由于加上这个参数，导致触发 QEMU 报错而无法成功构建；
当前可选解决方案有两个：1. 先在本地打包（pnpm --filter next run build），然后在 next/Dockerfile.prod 拷贝 .next/standalone（需要在next.config.ts 配置 output: 'standalone' ）到 docker 的workdir 下，经过多次尝试，在阿里云ECS 服务器终端 docker logs mono_next 始终有 cannot find module 'next' 的报错，当然，本地dev 模式没问题；2. 将 next.config.ts 的 output 修改为 'export'，这种情况 Dockerfile 只需要处理 run build ，并将打包的 dist 静态文件目录拷贝到 nginx 的静态文件目录即可，不需要在 compose.prod.yaml 增加 next 服务配置