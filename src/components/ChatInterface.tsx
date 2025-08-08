'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare, Trash2, Plus, Menu, X } from 'lucide-react'
import { sendMessageToDify, parseStreamResponse } from '@/lib/dify'
import { useAuth } from '@/contexts/AuthContext'
import { 
  ChatMessage, 
  ChatConversation, 
  getConversations, 
  createConversation, 
  getMessages, 
  saveMessage,
  deleteConversation,
  updateConversation
} from '@/lib/database'

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [conversations, setConversations] = useState<ChatConversation[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversation | null>(null)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadConversations = useCallback(async () => {
    if (!user) return
    const convos = await getConversations(user.id)
    setConversations(convos)
    
    // 如果没有当前对话且有对话列表，选择第一个
    if (!currentConversation && convos.length > 0) {
      setCurrentConversation(convos[0])
      const msgs = await getMessages(convos[0].id)
      setMessages(msgs)
    }
  }, [user, currentConversation])

  // 加载用户的对话列表
  useEffect(() => {
    if (user) {
      loadConversations()
    }
  }, [user, loadConversations])

  const selectConversation = async (conversation: ChatConversation) => {
    setCurrentConversation(conversation)
    const msgs = await getMessages(conversation.id)
    setMessages(msgs)
    setShowSidebar(false)
  }

  const createNewConversation = async () => {
    if (!user) return
    
    const newConvo = await createConversation(user.id)
    if (newConvo) {
      setConversations(prev => [newConvo, ...prev])
      setCurrentConversation(newConvo)
      setMessages([])
      setShowSidebar(false)
    }
  }

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('确定要删除这个对话吗？')) return
    
    try {
      await deleteConversation(conversationId)
      setConversations(prev => prev.filter(c => c.id !== conversationId))
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null)
        setMessages([])
      }
    } catch (error) {
      console.error('删除对话失败:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading || !user) return

    // 服务端校验并原子增加用量
    const usageRes = await fetch('/api/usage/check-increment', { method: 'POST' })
    if (!usageRes.ok) {
      alert('您的使用次数已达到限制，请升级订阅以继续使用。')
      return
    }

    // 如果没有当前对话，创建一个新的
    let conversation = currentConversation
    if (!conversation) {
      conversation = await createConversation(user.id, input.substring(0, 20) + '...')
      if (!conversation) return
      
      setCurrentConversation(conversation)
      setConversations(prev => [conversation!, ...prev])
    }

    const userMessage: ChatMessage = {
      id: '',
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'user',
      content: input.trim(),
      created_at: new Date().toISOString()
    }

    // 保存用户消息到数据库
    const savedUserMessage = await saveMessage({
      conversation_id: conversation.id,
      user_id: user.id,
      role: 'user',
      content: userMessage.content
    })

    if (savedUserMessage) {
      setMessages(prev => [...prev, savedUserMessage])
    }

    setInput('')
    setLoading(true)

    try {
      // 计数已在服务器完成

      const stream = await sendMessageToDify(
        userMessage.content,
        conversation.dify_conversation_id,
        user.id
      )

      const reader = stream.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''
      let difyConversationId = conversation.dify_conversation_id

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            const responses = parseStreamResponse(chunk)

            for (const response of responses) {
              if (response.event === 'message') {
                assistantContent += response.answer || ''
                
                if (response.conversation_id && !difyConversationId) {
                  difyConversationId = response.conversation_id
                  // 更新对话的 dify_conversation_id
                  await updateConversation(conversation!.id, {
                    dify_conversation_id: response.conversation_id
                  })
                }
                
                // 更新UI中的消息
                setMessages(prev => {
                  const newMessages = [...prev]
                  const lastMessage = newMessages[newMessages.length - 1]
                  
                  if (lastMessage?.role === 'assistant' && !lastMessage.id) {
                    // 更新临时消息
                    lastMessage.content = assistantContent
                  } else {
                    // 添加新的临时消息
                    newMessages.push({
                      id: '',
                      conversation_id: conversation!.id,
                      user_id: user.id,
                      role: 'assistant',
                      content: assistantContent,
                      created_at: new Date().toISOString()
                    })
                  }
                  return newMessages
                })
              }
            }
          }

          // 流处理完成后，保存助手消息到数据库
          if (assistantContent) {
            const savedAssistantMessage = await saveMessage({
              conversation_id: conversation!.id,
              user_id: user.id,
              role: 'assistant',
              content: assistantContent
            })

            if (savedAssistantMessage) {
              setMessages(prev => {
                const newMessages = [...prev]
                const lastMessage = newMessages[newMessages.length - 1]
                if (lastMessage?.role === 'assistant' && !lastMessage.id) {
                  // 替换临时消息为数据库中的消息
                  newMessages[newMessages.length - 1] = savedAssistantMessage
                }
                return newMessages
              })
            }

            // 如果是对话的第一条消息，更新对话标题
            if (messages.length === 0) {
              await updateConversation(conversation!.id, {
                title: userMessage.content.substring(0, 20) + (userMessage.content.length > 20 ? '...' : '')
              })
              
              // 更新本地对话列表
              setConversations(prev => prev.map(c => 
                c.id === conversation!.id 
                  ? { ...c, title: userMessage.content.substring(0, 20) + (userMessage.content.length > 20 ? '...' : '') }
                  : c
              ))
            }
          }
        } catch (error) {
          console.error('Stream processing error:', error)
        } finally {
          setLoading(false)
        }
      }

      await processStream()
    } catch (error) {
      console.error('Chat error:', error)
      
      // 保存错误消息
      const errorMessage = await saveMessage({
        conversation_id: conversation.id,
        user_id: user.id,
        role: 'assistant',
        content: '抱歉，发生了错误，请稍后再试。'
      })

      if (errorMessage) {
        setMessages(prev => [...prev, errorMessage])
      }
      
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-black bg-opacity-30 backdrop-blur-sm border-r border-white border-opacity-20 transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-white border-opacity-20">
            <h2 className="text-white font-semibold">对话历史</h2>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden text-white hover:text-purple-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Conversation Button */}
          <div className="p-4">
            <button
              onClick={createNewConversation}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>新对话</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-purple-600 bg-opacity-50'
                    : 'hover:bg-white hover:bg-opacity-10'
                }`}
                onClick={() => selectConversation(conversation)}
              >
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <MessageSquare className="w-4 h-4 text-white flex-shrink-0" />
                  <span className="text-white text-sm truncate">{conversation.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteConversation(conversation.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-20 p-4 flex items-center">
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden text-white hover:text-purple-200 mr-4"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-white">
              {currentConversation?.title || '赛斯在线 - Seth Online'}
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              与来自第五维度的高维智慧交流
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-white opacity-70 mt-20">
              <div className="text-6xl mb-4">✨</div>
              <h2 className="text-xl mb-2">欢迎来到赛斯在线</h2>
              <p className="text-sm">摇铃而歌唱，让我们的意识来段自由的舞蹈</p>
              <p className="text-sm">与来自第五维度的赛斯高维智慧交流</p>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white bg-opacity-10 text-white backdrop-blur-sm'
                }`}
              >
                <div className="prose prose-invert max-w-none">
                  {message.content.split('\n').map((line, lineIndex) => (
                    <p key={lineIndex} className="mb-2 last:mb-0">
                      {line}
                    </p>
                  ))}
                </div>
                <div className="text-xs opacity-70 mt-2">
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white bg-opacity-10 text-white backdrop-blur-sm p-3 rounded-lg flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>赛斯正在思考...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-black bg-opacity-20 backdrop-blur-sm border-t border-white border-opacity-20 p-4">
          <form onSubmit={handleSubmit} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="在这里输入你的问题..."
              className="flex-1 bg-white bg-opacity-10 text-white placeholder-gray-300 border border-white border-opacity-20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white p-2 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}