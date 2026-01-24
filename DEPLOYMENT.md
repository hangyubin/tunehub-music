# 🚀 TuneHub Music 部署指南

本文档详细介绍 TuneHub Music 的多种部署方式。

## 📋 目录

- [Docker 部署（推荐）](#docker-部署推荐)
- [传统部署](#传统部署)
- [常见问题](#常见问题)

## 🐳 Docker 部署（推荐）

Docker 部署是最简单、最可靠的方式，无需担心环境依赖问题。

### 前置要求

- Docker 20.10+
- Docker Compose 1.29+（可选）

### 方式一：Docker Compose（推荐）

这是最简单的部署方式，适合大多数场景。

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/tunehub-music.git
cd tunehub-music

# 2. 使用 Docker Compose 启动
docker-compose up -d

# 3. 查看日志
docker-compose logs -f

# 4. 访问应用
# 打开浏览器访问 http://localhost:3000
```

#### 停止和清理

```bash
# 停止容器
docker-compose down

# 停止并删除数据
docker-compose down -v

# 重启容器
docker-compose restart
```

### 方式二：使用 Dockerfile

适合需要自定义配置的场景。

```bash
# 1. 构建镜像
docker build -t tunehub-music:latest .

# 2. 运行容器
docker run -d \
  --name tunehub-music \
  -p 3000:80 \
  --restart unless-stopped \
  tunehub-music:latest

# 3. 查看日志
docker logs -f tunehub-music

# 4. 访问应用
# 打开浏览器访问 http://localhost:3000
```

#### 容器管理

```bash
# 停止容器
docker stop tunehub-music

# 启动容器
docker start tunehub-music

# 重启容器
docker restart tunehub-music

# 删除容器
docker rm tunehub-music

# 删除镜像
docker rmi tunehub-music:latest
```

### 自定义端口

如果需要使用其他端口，可以修改映射：

```bash
# 使用 8080 端口
docker run -d -p 8080:80 --name tunehub-music tunehub-music:latest

# 访问 http://localhost:8080
```

或修改 `docker-compose.yml`：

```yaml
services:
  tunehub-music:
    ports:
      - "8080:80"  # 改为你想要的端口
```

### 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器资源使用情况
docker stats tunehub-music

# 进入容器内部（调试用）
docker exec -it tunehub-music sh
```

## 🖥️ 传统部署

如果不想使用 Docker，可以选择传统的 Nginx 部署方式。

### 前置要求

- Node.js 18+
- npm 或 yarn
- Nginx

### 步骤

#### 1. 构建项目

```bash
# 安装依赖
npm install

# 构建生产版本
npm run build

# 构建完成后，dist 目录包含所有静态文件
```

#### 2. 配置 Nginx

创建 Nginx 配置文件 `/etc/nginx/sites-available/tunehub-music`：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 改为你的域名
    root /var/www/tunehub-music;  # 改为你的部署路径
    index index.html;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/json application/javascript;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

#### 3. 部署文件

```bash
# 复制构建产物到 Nginx 目录
sudo mkdir -p /var/www/tunehub-music
sudo cp -r dist/* /var/www/tunehub-music/

# 设置正确的权限
sudo chown -R www-data:www-data /var/www/tunehub-music
sudo chmod -R 755 /var/www/tunehub-music
```

#### 4. 启用站点

```bash
# 创建符号链接
sudo ln -s /etc/nginx/sites-available/tunehub-music /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重载 Nginx
sudo systemctl reload nginx
```

#### 5. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期（已自动配置）
sudo certbot renew --dry-run
```

## 🌐 云平台部署

### Vercel

1. 在 Vercel 导入项目
2. 构建命令：`npm run build`
3. 输出目录：`dist`
4. 一键部署

### Netlify

1. 在 Netlify 导入项目
2. 构建命令：`npm run build`
3. 发布目录：`dist`
4. 一键部署

### 阿里云 / 腾讯云

1. 购买云服务器（ECS/CVM）
2. 使用 Docker 部署（推荐）
3. 或使用传统 Nginx 部署
4. 配置安全组规则开放 80/443 端口

## ❓ 常见问题

### Docker 构建失败

**问题 1**：`npm install` 失败或超时

**解决**：使用国内镜像源

```dockerfile
# 在 Dockerfile 中添加
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci
```

**问题 2**：`vue-tsc` 报错 `Search string not found`

**原因**：vue-tsc 版本与 TypeScript 版本不兼容

**解决**：项目已配置 `npm run build` 跳过类型检查。如需类型检查，使用 `npm run build:check`

```bash
# 如果仍有问题，可在本地更新依赖
npm install vue-tsc@latest --save-dev
```

### 端口已被占用

**问题**：端口 3000 已被其他应用使用

**解决**：更改映射端口

```bash
# 使用其他端口，例如 8080
docker run -d -p 8080:80 --name tunehub-music tunehub-music
```

### 页面 404 错误

**问题**：刷新页面出现 404

**解决**：确保 Nginx 配置了 SPA 路由支持

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 音频无法播放

**问题**：Mixed Content 错误

**解决**：
- 确保网站使用 HTTPS
- API 会自动将 HTTP URL 转换为 HTTPS

### 容器启动后无法访问

**问题**：容器运行但无法访问

**解决**：

```bash
# 1. 检查容器状态
docker ps

# 2. 查看容器日志
docker logs tunehub-music

# 3. 检查端口映射
docker port tunehub-music

# 4. 确认防火墙规则
sudo ufw status
sudo ufw allow 3000
```

### 更新部署

**Docker 部署更新**：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建镜像
docker-compose build --no-cache

# 3. 重启容器
docker-compose up -d

# 或使用 Dockerfile
docker build -t tunehub-music:latest .
docker stop tunehub-music
docker rm tunehub-music
docker run -d -p 3000:80 --name tunehub-music tunehub-music:latest
```

**传统部署更新**：

```bash
# 1. 拉取最新代码
git pull

# 2. 重新构建
npm install
npm run build

# 3. 复制文件
sudo cp -r dist/* /var/www/tunehub-music/

# 4. 重载 Nginx
sudo systemctl reload nginx
```

## 🔒 安全建议

1. **使用 HTTPS**：强烈建议配置 SSL 证书
2. **限制访问**：配置防火墙和安全组规则
3. **定期更新**：保持 Docker 镜像和依赖包最新
4. **备份数据**：定期备份重要配置文件
5. **监控日志**：定期查看应用和服务器日志

## 📊 性能优化

### Nginx 优化

```nginx
# 启用 HTTP/2
listen 443 ssl http2;

# 增加工作进程
worker_processes auto;

# 优化缓存
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g;
```

### Docker 优化

```bash
# 限制容器资源使用
docker run -d \
  --cpus="1.0" \
  --memory="512m" \
  -p 3000:80 \
  --name tunehub-music \
  tunehub-music:latest
```

## 📝 维护检查清单

- [ ] 检查容器/服务状态
- [ ] 查看错误日志
- [ ] 监控磁盘空间
- [ ] 检查 SSL 证书有效期
- [ ] 更新依赖包
- [ ] 清理无用的 Docker 镜像
- [ ] 测试备份恢复流程

## 🆘 获取帮助

如果遇到部署问题：

1. 查看项目 [Issues](https://github.com/yourusername/tunehub-music/issues)
2. 提交新的 Issue 并附上：
   - 详细的错误信息
   - 部署环境（OS、Docker 版本等）
   - 操作步骤
3. 查看日志文件获取更多信息

---

祝部署顺利！🎉
