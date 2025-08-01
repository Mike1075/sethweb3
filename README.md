# Seth Online (赛斯在线)

与来自第五维度的赛斯高维智慧交流，解决你所有的困惑和终极问题。

## 功能特性

- 🤖 **智能对话**: 基于 Dify API 的高质量 AI 对话
- 👤 **用户系统**: 支持邮箱、用户名密码、Google 登录
- 💬 **聊天记录**: 完整的对话历史保存和管理
- 📱 **响应式设计**: 优先保证手机端用户体验
- 📊 **订阅管理**: 免费版、标准版、尊享版三种套餐
- 📁 **数据导出**: 支持 JSON 和 TXT 格式导出聊天记录
- 🔒 **数据安全**: 基于 Supabase 的安全数据存储

## 技术栈

- **前端**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase (PostgreSQL)
- **认证**: Supabase Auth
- **AI 服务**: Dify API
- **部署**: Netlify
- **支付**: Stripe (国际) + Ping++ (国内)

## 环境配置

1. 复制环境变量文件：
```bash
cp .env.example .env.local
```

2. 配置环境变量：
```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://wgtvbghhwbogknjkttuo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Dify API 配置
DIFY_API_URL=https://pro.aifunbox.com/v1/
DIFY_API_KEY=app-tEivDPsjZY6phvYSqscy9Cqr
```

## 数据库设置

1. 在 Supabase 中创建新项目
2. 运行 SQL 脚本创建表结构：
```sql
-- 执行 supabase-schema.sql 中的内容
```

## 本地开发

1. 安装依赖：
```bash
npm install
```

2. 启动开发服务器：
```bash
npm run dev
```

3. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 构建和部署

### 本地构建
```bash
npm run build
npm start
```

### Netlify 部署

1. 将代码推送到 GitHub 仓库：https://github.com/Mike1075/sethweb3.git
2. 连接 Netlify 到 GitHub 仓库
3. 配置环境变量
4. 自动部署

## 订阅套餐

### 免费版
- 15次对话机会
- 基础AI问答
- 简单对话记录

### 标准版 ($19.99/月)
- 150次/月对话
- 完整对话历史
- 聊天记录导出
- 优先响应速度

### 尊享版 ($49.99/月)
- 500次/月对话
- 无限对话历史
- 多格式导出
- 最快响应速度
- 专属客服支持

## 开发规范

- 使用 TypeScript 进行类型安全开发
- 遵循 ESLint 代码规范
- 采用响应式设计，移动端优先
- 所有 API 调用都需要错误处理
- 用户数据通过 RLS 策略保护

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交 Issue 或联系开发团队。
