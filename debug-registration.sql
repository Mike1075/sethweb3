-- 注册问题诊断和修复脚本

-- 1. 检查 user_profiles 表是否存在
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'user_profiles'
) as user_profiles_exists;

-- 2. 检查触发器是否存在
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 3. 检查函数是否存在
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- 4. 启用 RLS 但允许插入（这可能是问题所在）
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 创建允许用户插入自己配置的策略
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 6. 创建允许用户查看自己配置的策略  
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 7. 创建允许用户更新自己配置的策略
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 8. 测试数据库连接和权限
SELECT 'Database connection successful' as status;