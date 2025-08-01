import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  subscription_type: 'free' | 'standard' | 'premium'
  usage_count: number
  usage_limit: number
  created_at: string
  updated_at: string
}

export interface ChatConversation {
  id: string
  user_id: string
  title: string
  dify_conversation_id?: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  subscription_type: 'standard' | 'premium'
  status: 'active' | 'cancelled' | 'expired'
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  created_at: string
  updated_at: string
}

// 用户配置相关
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export const updateUserProfile = async (userId: string, updates: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

// 聊天会话相关
export const getConversations = async (userId: string): Promise<ChatConversation[]> => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching conversations:', error)
    return []
  }

  return data || []
}

export const createConversation = async (userId: string, title: string = '新对话'): Promise<ChatConversation | null> => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert([
      {
        user_id: userId,
        title,
      }
    ])
    .select()
    .single()

  if (error) {
    console.error('Error creating conversation:', error)
    return null
  }

  return data
}

export const updateConversation = async (conversationId: string, updates: Partial<ChatConversation>) => {
  const { data, error } = await supabase
    .from('chat_conversations')
    .update(updates)
    .eq('id', conversationId)
    .select()
    .single()

  if (error) {
    console.error('Error updating conversation:', error)
    throw error
  }

  return data
}

export const deleteConversation = async (conversationId: string) => {
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', conversationId)

  if (error) {
    console.error('Error deleting conversation:', error)
    throw error
  }
}

// 聊天消息相关
export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export const saveMessage = async (message: Omit<ChatMessage, 'id' | 'created_at'>): Promise<ChatMessage | null> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert([message])
    .select()
    .single()

  if (error) {
    console.error('Error saving message:', error)
    return null
  }

  return data
}

export const deleteMessage = async (messageId: string) => {
  const { error } = await supabase
    .from('chat_messages')
    .delete()
    .eq('id', messageId)

  if (error) {
    console.error('Error deleting message:', error)
    throw error
  }
}

// 导出聊天记录
export const exportChatHistory = async (userId: string, format: 'json' | 'txt' = 'json') => {
  const conversations = await getConversations(userId)
  const chatHistory = []

  for (const conversation of conversations) {
    const messages = await getMessages(conversation.id)
    chatHistory.push({
      conversation,
      messages
    })
  }

  if (format === 'json') {
    return JSON.stringify(chatHistory, null, 2)
  } else {
    let txtContent = ''
    for (const chat of chatHistory) {
      txtContent += `=== ${chat.conversation.title} ===\n`
      txtContent += `创建时间: ${new Date(chat.conversation.created_at).toLocaleString()}\n\n`
      
      for (const message of chat.messages) {
        txtContent += `[${message.role === 'user' ? '用户' : '赛斯'}] ${new Date(message.created_at).toLocaleString()}\n`
        txtContent += `${message.content}\n\n`
      }
      txtContent += '\n---\n\n'
    }
    return txtContent
  }
}

// 增加使用次数
export const incrementUsageCount = async (userId: string) => {
  const profile = await getUserProfile(userId)
  if (!profile) return

  const newCount = profile.usage_count + 1
  await updateUserProfile(userId, { usage_count: newCount })

  return newCount
}

// 检查使用限制
export const checkUsageLimit = async (userId: string): Promise<boolean> => {
  const profile = await getUserProfile(userId)
  if (!profile) return false

  return profile.usage_count < profile.usage_limit
}