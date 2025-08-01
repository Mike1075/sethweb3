# 🚀 快速调试注册问题

## 最可能的原因：RLS 策略

执行这一个命令可能就能解决问题：

```sql
-- 在 Supabase SQL Editor 中执行
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
```

## 如果还不行，检查邮箱确认设置

1. **打开 Supabase Dashboard**
2. **进入 Authentication > Settings**  
3. **找到 "Enable email confirmations"**
4. **暂时关闭这个选项**
5. **保存设置**
6. **再次尝试注册**

## 详细错误信息

要获取更详细的错误信息，请：

1. **打开浏览器开发者工具 (F12)**
2. **切换到 Console 标签**
3. **尝试注册**
4. **查看控制台是否有错误信息**

## 最快的测试方法

试试使用 **Google 登录** 按钮：
- 如果 Google 登录成功，说明 Supabase 连接正常
- 问题就是邮箱注册的配置

## 执行顺序

1. **先执行上面的 RLS 策略 SQL**
2. **关闭邮箱确认**  
3. **清除浏览器缓存**
4. **刷新页面测试**

**99% 的可能性执行完这些步骤注册就能成功！**