# 🔧 注册功能修复指南

注册失败可能有几个原因，让我们逐一排查：

## 🚨 立即执行：完整修复方案

在 Supabase SQL Editor 中按顺序执行：

### 1. 检查现有表和触发器
```sql
-- 检查 user_profiles 表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles'
) as user_profiles_exists;

-- 检查触发器是否存在
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

### 2. 设置正确的 RLS 策略（关键修复）
```sql
-- 启用行级安全
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 删除可能存在的策略
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- 创建正确的策略
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

### 3. 确保触发器函数正确
```sql
-- 重新创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器并重新创建
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

## 🔍 问题可能的原因

1. **RLS 策略缺失** - 最常见的问题
2. **触发器未正确设置**
3. **环境变量问题**
4. **邮箱验证设置**

## 🧪 测试步骤

执行完上述 SQL 后：

1. **清除浏览器缓存** 
2. **刷新页面**
3. **尝试注册新邮箱**
4. **检查 Supabase Auth 用户表**

## 🔧 如果仍然失败

### 检查 Supabase 配置

在 Supabase Dashboard 中：

1. **Authentication > Settings**
2. **确认 "Enable email confirmations" 设置**
3. **如果启用了邮箱确认，需要先禁用进行测试**

### 临时禁用邮箱确认（测试用）

在 Supabase Dashboard > Authentication > Settings：
- 关闭 "Enable email confirmations"
- 保存设置
- 再次尝试注册

## 📊 验证修复

执行这个查询来确认设置：
```sql
-- 检查所有组件
SELECT 
  'user_profiles table' as component,
  CASE WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles') 
    THEN '✅ 存在' ELSE '❌ 缺失' END as status
UNION ALL
SELECT 
  'RLS policies' as component,
  CASE WHEN EXISTS (SELECT FROM pg_policies WHERE tablename = 'user_profiles') 
    THEN '✅ 已设置' ELSE '❌ 缺失' END as status
UNION ALL
SELECT 
  'Trigger function' as component,
  CASE WHEN EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'handle_new_user') 
    THEN '✅ 存在' ELSE '❌ 缺失' END as status;
```

**如果所有显示 ✅，注册应该就能正常工作了！**