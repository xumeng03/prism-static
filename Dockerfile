# ---- 构建阶段：使用 Node.js 编译前端资源 ----
FROM node:22-alpine AS builder
# 设置容器内工作目录
WORKDIR /app
# 优先复制依赖清单，利用 Docker 层缓存（依赖未变时跳过 npm ci）
COPY package*.json ./
# 安装依赖（ci 模式：严格按 package-lock.json，不修改文件）
RUN npm ci
# 复制全部源码
COPY . .
# 执行 TypeScript 编译 + Vite 打包，产物输出到 /app/dist
RUN npm run build

# ---- 运行阶段：用轻量 Nginx 镜像托管静态文件 ----
FROM nginx:1.27-alpine
# 将构建产物复制到 Nginx 默认静态目录
COPY --from=builder /app/dist /usr/share/nginx/html
# 使用自定义 Nginx 配置（支持前端路由 fallback）
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 声明容器监听端口
EXPOSE 80