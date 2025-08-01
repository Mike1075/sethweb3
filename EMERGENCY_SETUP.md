# 🚨 紧急数据库设置指南

**好消息：应用已成功部署到 Netlify！** 🎉  
**问题：数据库表还没有创建，所以注册功能失败。**

## 立即执行（在 Supabase SQL Editor 中）

### 方法 1：最简单的方式

**只需执行这一条命令就能让注册功能工作：**

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_type TEXT DEFAULT 'free',
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);
```

**然后执行这个创建用户自动配置功能：**

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 测试步骤

1. **在 Supabase SQL Editor 执行上述 SQL**
2. **回到应用页面尝试注册**
3. **应该可以成功注册了！**

## 完整功能设置

如果您想要完整的聊天功能，稍后可以继续执行：

```sql
-- 聊天会话表
CREATE TABLE chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT '新对话',
  dify_conversation_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 聊天消息表  
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 当前状态

✅ **Netlify 部署成功**  
✅ **应用界面正常**  
❌ **需要创建数据库表**  

**执行第一个 SQL 命令后，注册功能就能正常工作了！**