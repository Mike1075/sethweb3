# Supabase 数据库设置指南

由于 Supabase SQL Editor 不能直接执行整个 `.sql` 文件，请按照以下步骤逐步执行 SQL 脚本：

## ⚠️ 重要提示

在 Supabase SQL Editor 中，**每次只能执行一个步骤**，不要一次性粘贴所有内容。

## 执行步骤

### 步骤 1: 创建用户配置表
复制并执行 `database-setup-step1.sql` 中的内容

### 步骤 2: 创建聊天会话表
复制并执行 `database-setup-step2.sql` 中的内容

### 步骤 3: 创建聊天消息表
复制并执行 `database-setup-step3.sql` 中的内容

### 步骤 4: 创建订阅记录表
复制并执行 `database-setup-step4.sql` 中的内容

### 步骤 5: 启用 RLS
复制并执行 `database-setup-step5.sql` 中的内容

### 步骤 6: 用户配置表 RLS 策略
复制并执行 `database-setup-step6.sql` 中的内容

### 步骤 7: 聊天会话表 RLS 策略
复制并执行 `database-setup-step7.sql` 中的内容

### 步骤 8: 聊天消息表 RLS 策略
复制并执行 `database-setup-step8.sql` 中的内容

### 步骤 9: 订阅记录表 RLS 策略
复制并执行 `database-setup-step9.sql` 中的内容

### 步骤 10: 创建用户配置函数
复制并执行 `database-setup-step10.sql` 中的内容

### 步骤 11: 创建用户注册触发器
复制并执行 `database-setup-step11.sql` 中的内容

### 步骤 12: 创建时间戳更新触发器
复制并执行 `database-setup-step12.sql` 中的内容

## 验证设置

执行完所有步骤后，您可以在 Supabase 的 Table Editor 中看到以下表：
- `user_profiles`
- `chat_conversations` 
- `chat_messages`
- `subscriptions`

## 如果遇到错误

1. **权限错误**: 确保您有足够的权限执行这些操作
2. **表已存在**: 可以忽略 `CREATE TABLE IF NOT EXISTS` 的警告
3. **策略已存在**: 可以先删除同名策略再重新创建

## 快速验证

执行以下查询来验证设置是否正确：

```sql
-- 检查表是否创建成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions');

-- 检查 RLS 是否启用
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions');
```