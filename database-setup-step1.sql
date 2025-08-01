-- 步骤 1: 创建用户配置表
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_type TEXT DEFAULT 'free' CHECK (subscription_type IN ('free', 'standard', 'premium')),
  usage_count INTEGER DEFAULT 0,
  usage_limit INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  PRIMARY KEY (id)
);