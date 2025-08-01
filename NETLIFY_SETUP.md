# Netlify 部署配置指南

## 🚨 重要：环境变量配置

在 Netlify 后台必须配置以下环境变量，否则构建会失败：

### 必须配置的环境变量

在 Netlify 项目的 **Site settings > Environment variables** 中添加：

```env
NEXT_PUBLIC_SUPABASE_URL=https://wgtvbghhwbogknjkttuo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndndHZiZ2hod2JvZ2tuamt0dHVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODU3ODksImV4cCI6MjA2ODE2MTc4OX0.Zz-h6sz1Pc-0vO9zbAsw7OI4pWeoBgZNvrDUWqLwooM
DIFY_API_URL=https://pro.aifunbox.com/v1/
DIFY_API_KEY=app-tEivDPsjZY6phvYSqscy9Cqr
```

## 部署步骤

### 1. 连接 GitHub 仓库
- 登录 Netlify
- 点击 "New site from Git"
- 选择 GitHub 并授权
- 选择仓库：`Mike1075/sethweb3`

### 2. 构建设置
Netlify 会自动检测到 `netlify.toml` 配置文件，构建设置为：
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: 20

### 3. 配置环境变量
⚠️ **关键步骤** - 在部署前必须完成：

1. 进入 **Site settings**
2. 点击 **Environment variables**
3. 添加上述 4 个环境变量
4. 保存设置

### 4. 触发部署
配置完环境变量后：
1. 点击 **Deploys** 标签
2. 点击 **Trigger deploy**
3. 选择 **Deploy site**

## 常见问题排查

### 构建失败：`supabaseUrl is required`
**原因**: 环境变量未正确配置
**解决**: 检查 Netlify 后台环境变量设置

### Node.js 版本警告
**原因**: 使用了旧版本 Node.js
**解决**: netlify.toml 已配置 Node.js 20

### 构建缓存问题
**原因**: Next.js 缓存配置
**解决**: 首次部署正常，后续会自动缓存

## 验证部署

部署成功后，访问生成的 Netlify URL，应该能看到：
1. 首页显示 "赛斯在线" 欢迎界面
2. 可以点击注册/登录按钮
3. 页面样式正确显示（紫蓝渐变背景）

## 域名配置（可选）

如果需要自定义域名：
1. 在 **Site settings > Domain management** 中
2. 点击 **Add custom domain**
3. 输入您的域名
4. 按照指引配置 DNS

## 数据库设置

⚠️ 记得按照 `DATABASE_SETUP.md` 设置 Supabase 数据库表，否则应用功能不完整。