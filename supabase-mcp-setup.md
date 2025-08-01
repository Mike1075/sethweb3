# Supabase MCP 设置指南

如果您希望我能够直接操作您的 Supabase 数据库，可以按照以下步骤设置 MCP (Model Context Protocol)：

## 方法 1: 提供 Service Role Key（推荐用于开发）

1. 在 Supabase 项目中获取 Service Role Key：
   - 进入 Supabase Dashboard
   - 选择您的项目
   - 进入 Settings > API
   - 复制 "service_role" key

2. 提供给我以下信息：
   ```
   Project URL: https://wgtvbghhwbogknjkttuo.supabase.co
   Service Role Key: [您的service_role密钥]
   ```

## 方法 2: 临时 SQL 访问

您也可以：
1. 在 Supabase SQL Editor 中给我临时的 SQL 执行权限
2. 或者您可以复制粘贴我提供的 SQL 命令逐一执行

## 方法 3: 我已经准备好的分步指南

如果您不想配置 MCP，可以直接使用我准备的分步 SQL 脚本：
- `database-setup-step1.sql` 到 `database-setup-step12.sql`
- 按照 `DATABASE_SETUP.md` 的指引逐步执行

## 当前状态

现在的修复已经解决了 Netlify 部署问题：
✅ 修复了环境变量访问问题
✅ 更新了 Node.js 版本到 20
✅ 修复了构建配置

## 下一步

1. **立即重新部署到 Netlify**（构建应该成功）
2. **在 Netlify 配置环境变量**（参考 NETLIFY_SETUP.md）
3. **设置数据库**（使用分步 SQL 脚本或 MCP）

您希望我通过哪种方式帮您设置数据库？