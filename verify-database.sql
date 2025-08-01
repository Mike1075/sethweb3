-- Seth Online 数据库验证脚本
-- 在完成主设置后运行此脚本来验证一切正常

-- 1. 检查所有表是否存在
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions') 
    THEN '✅ 存在' 
    ELSE '❌ 缺失' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions')
ORDER BY table_name;

-- 2. 检查 RLS 是否启用
SELECT 
  schemaname,
  tablename,
  CASE 
    WHEN rowsecurity = true THEN '✅ RLS 已启用'
    ELSE '❌ RLS 未启用'
  END as rls_status
FROM pg_tables 
WHERE tablename IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions')
ORDER BY tablename;

-- 3. 检查策略数量
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions')
GROUP BY schemaname, tablename
ORDER BY tablename;

-- 4. 检查触发器
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers 
WHERE event_object_table IN ('users', 'user_profiles', 'chat_conversations', 'subscriptions')
ORDER BY event_object_table, trigger_name;

-- 5. 检查函数
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
AND routine_name IN ('handle_new_user', 'update_updated_at_column')
ORDER BY routine_name;