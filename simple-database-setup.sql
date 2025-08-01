-- 超级简化的数据库设置脚本
-- 逐个执行以下命令

-- 第1步：创建用户配置表
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