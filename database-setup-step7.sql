-- 步骤 7: 创建聊天会话表的 RLS 策略
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON chat_conversations
  FOR DELETE USING (auth.uid() = user_id);