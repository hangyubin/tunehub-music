# 🎵 TuneHub Music

基于 Vue 3 + TypeScript 的现代化音乐聚合平台，采用 Apple Music 风格设计，支持 QQ音乐、网易云音乐、酷我音乐三大平台。

## ✨ 核心特性

### 🎼 音乐功能
- **🔍 聚合搜索** - 同时搜索所有平台，快速找到想听的歌曲
- **📊 排行榜** - 查看各平台实时热门榜单
- **🎧 完整播放器** - 播放/暂停/上一首/下一首/进度控制/音量调节
- **📝 实时歌词** - 滚动高亮显示，支持卡拉OK效果
- **🎬 全屏歌词** - 沉浸式歌词体验，从左到右渐变高亮
- **📋 播放列表** - 管理当前播放队列，随时查看和切换
- **🔄 播放模式** - 列表播放/单曲循环/随机播放
- **⬇️ 歌曲下载** - 一键下载喜欢的歌曲
- **🖼️ 封面展示** - 美观的专辑封面显示
- **🔀 自动切换** - 播放失败时自动切换平台

### 🎨 界面设计
- **🍎 Apple Music 风格** - 简洁优雅的白色主题
- **💎 玻璃态效果** - 现代化的毛玻璃背景
- **✨ 流畅动画** - 精心打磨的交互动效
- **📱 响应式设计** - 完美适配桌面端和移动端
- **🧭 顶部导航** - 便捷的页面导航栏

## 🛠️ 技术栈

- **前端框架**: Vue 3 + Composition API
- **构建工具**: Vite 5
- **编程语言**: TypeScript
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios
- **样式方案**: SCSS + BEM 规范
- **后端 API**: TuneHub API (music-dl.sayqz.com)

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/yourusername/tunehub-music.git
cd tunehub-music

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 生产构建

```bash
# 构建项目
npm run build

# 预览生产构建
npm run preview
```

## 🐳 Docker 部署

### 方式一：使用 Docker Compose（推荐）

```bash
# 构建并启动容器
docker-compose up -d

# 访问 http://localhost:3000
```

### 方式二：使用 Dockerfile

```bash
# 构建镜像
docker build -t tunehub-music .

# 运行容器
docker run -d -p 3000:80 --name tunehub-music tunehub-music

# 访问 http://localhost:3000
```

### Docker 命令

```bash
# 查看容器日志
docker logs tunehub-music

# 停止容器
docker stop tunehub-music

# 重启容器
docker restart tunehub-music

# 删除容器
docker rm tunehub-music

# 删除镜像
docker rmi tunehub-music
```

## 📁 项目结构

```
tunehub-music/
├── src/
│   ├── api/                      # API 请求层
│   │   ├── http.ts              # Axios 配置
│   │   ├── tunehub.ts           # API 统一请求
│   │   └── modules/             # API 模块划分
│   │       ├── search.ts        # 搜索相关
│   │       ├── toplist.ts       # 排行榜相关
│   │       └── track.ts         # 歌曲相关
│   ├── assets/                   # 静态资源
│   │   └── styles/              # 全局样式
│   │       ├── variables.scss   # SCSS 变量
│   │       ├── mixins.scss      # SCSS 混合
│   │       └── global.scss      # 全局样式
│   ├── components/               # 组件目录
│   │   ├── NavBar.vue           # 导航栏
│   │   ├── PlayerBar.vue        # 底部播放器
│   │   ├── TrackList.vue        # 歌曲列表
│   │   ├── PlaylistPanel.vue    # 播放列表面板
│   │   ├── LyricPanel.vue       # 歌词侧边栏
│   │   ├── FullScreenLyric.vue  # 全屏歌词
│   │   └── SourceSwitchToast.vue # 平台切换提示
│   ├── pages/                    # 页面组件
│   │   ├── Home.vue             # 首页
│   │   ├── Search.vue           # 搜索页
│   │   ├── Toplists.vue         # 排行榜列表
│   │   └── ToplistDetail.vue    # 排行榜详情
│   ├── router/                   # 路由配置
│   │   └── index.ts
│   ├── stores/                   # 状态管理
│   │   ├── player.ts            # 播放器状态
│   │   └── search.ts            # 搜索状态
│   ├── types/                    # TypeScript 类型
│   │   ├── api.ts               # API 类型定义
│   │   └── models.ts            # 数据模型
│   ├── utils/                    # 工具函数
│   │   └── time.ts              # 时间格式化
│   ├── App.vue                   # 根组件
│   └── main.ts                   # 应用入口
├── public/                       # 静态资源
├── Dockerfile                    # Docker 配置
├── docker-compose.yml            # Docker Compose 配置
├── nginx.conf                    # Nginx 配置
├── .dockerignore                 # Docker 忽略文件
├── vite.config.ts               # Vite 配置
├── tsconfig.json                # TypeScript 配置
└── package.json                  # 项目依赖
```

## 📖 使用指南

### 导航栏
- **首页** - 快速开始，选择搜索或浏览排行榜
- **排行榜** - 查看各平台热门榜单
- **搜索** - 搜索歌曲、歌手或专辑

### 搜索功能
1. 在搜索框输入关键词
2. 选择"全部平台"进行聚合搜索
3. 或选择具体平台（QQ/网易云/酷我）搜索
4. 点击歌曲播放，或点击下载按钮下载

### 播放器控制
- **播放/暂停** - 点击中间大按钮
- **上一首/下一首** - 点击左右按钮
- **进度条** - 点击任意位置跳转
- **音量控制** - 悬停在音量按钮上调节
- **播放模式** - 列表(📜)/循环(🔁)/随机(🔀)
- **播放列表** - 查看当前队列 (📋)
- **歌词显示** - 显示/隐藏歌词面板 (📝)
- **封面** - 点击封面进入全屏歌词

### 全屏歌词
- 点击播放器封面或全屏歌词按钮进入
- 歌词实时高亮，从左到右渐变显示
- 支持进度控制和播放控制
- 点击 ✕ 退出全屏

### 播放列表
- 点击播放列表按钮 (📋) 打开
- 查看所有已添加的歌曲
- 点击任意歌曲切换播放
- 点击下载按钮下载歌曲
- 点击 ✕ 删除单首歌曲
- 点击"清空"清除所有歌曲

## 🔌 API 说明

项目使用 TuneHub API：`https://music-dl.sayqz.com/api/`

### 主要接口

| 功能 | 接口示例 |
|------|---------|
| 聚合搜索 | `?type=aggregateSearch&keyword=周杰伦` |
| 单平台搜索 | `?type=search&source=qq&keyword=周杰伦` |
| 排行榜列表 | `?type=toplists&source=qq` |
| 排行榜详情 | `?type=toplist&source=qq&id=26` |
| 播放地址 | `?type=url&source=qq&id=xxx&br=320k` |
| 歌词 | `?type=lrc&source=qq&id=xxx` |
| 封面 | `?type=pic&source=qq&id=xxx` |

### 支持的音质
- `128k` - 标准音质
- `320k` - 高品质（默认）
- `flac` - 无损音质
- `flac24bit` - Hi-Res 音质

### 支持的平台
- `qq` - QQ音乐
- `netease` - 网易云音乐
- `kuwo` - 酷我音乐

## ⚙️ 配置说明

### 环境变量

项目支持通过环境变量配置：

```bash
# .env.development (开发环境)
VITE_API_BASE_URL=/api

# .env.production (生产环境)
VITE_API_BASE_URL=https://music-dl.sayqz.com/api
```

### Nginx 配置

生产环境使用 Nginx 部署，配置文件 `nginx.conf` 包含：
- Gzip 压缩
- 静态资源缓存
- SPA 路由支持
- 安全头设置

## 🔧 开发指南

### 代码规范
- TypeScript 严格模式
- ESLint + Prettier
- BEM CSS 命名规范
- Composition API + `<script setup>`

### 提交规范
```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试相关
chore: 构建/工具链相关
```

## ⚠️ 注意事项

### API 限制
- 部分歌曲可能因版权限制无法播放
- 建议合理使用 API，避免频繁请求
- 网易云音乐的 HTTP 链接会自动转换为 HTTPS

### 浏览器兼容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 移动端
- 已适配移动端布局和触控操作
- 建议在真实设备上测试音频播放
- 注意浏览器的自动播放策略

## 🎯 功能路线图

- [x] 基础播放功能
- [x] 歌词显示
- [x] 播放列表
- [x] 全屏歌词
- [x] 歌曲下载
- [x] 导航栏
- [x] Docker 部署
- [ ] 收藏功能
- [ ] 歌单管理
- [ ] 深色模式切换
- [ ] PWA 支持
- [ ] 键盘快捷键

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📝 开源协议

本项目采用 [MIT](LICENSE) 协议开源。

## 🙏 致谢

- [TuneHub API](https://music-dl.sayqz.com) - 提供音乐数据接口
- [Vue.js](https://vuejs.org) - 渐进式 JavaScript 框架
- [Vite](https://vitejs.dev) - 下一代前端构建工具

## 📧 联系方式

如有问题或建议，欢迎通过以下方式联系：

- 提交 Issue
- 发送邮件

---

⭐ 如果这个项目对你有帮助，欢迎 Star 支持！
