'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ChatInterface from '@/components/ChatInterface'
import AuthModal from '@/components/AuthModal'
import SubscriptionModal from '@/components/SubscriptionModal'
import { LogOut, User, Crown, Download, Settings } from 'lucide-react'
import { getUserProfile, exportChatHistory, UserProfile } from '@/lib/database'

export default function Home() {
  const { user, loading, signOut } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [exporting, setExporting] = useState(false)

  const loadUserProfile = useCallback(async () => {
    if (!user) return
    const profile = await getUserProfile(user.id)
    setUserProfile(profile)
  }, [user])

  // 加载用户配置
  useEffect(() => {
    if (user) {
      loadUserProfile()
    }
  }, [user, loadUserProfile])

  const handleExportChat = async (format: 'json' | 'txt') => {
    if (!user) return
    
    setExporting(true)
    try {
      const data = await exportChatHistory(user.id, format)
      
      const blob = new Blob([data], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `seth-chat-history.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('导出失败:', error)
      alert('导出失败，请稍后再试')
    } finally {
      setExporting(false)
    }
  }

  const getSubscriptionColor = (type: string) => {
    switch (type) {
      case 'premium': return 'text-yellow-300 bg-yellow-500'
      case 'standard': return 'text-purple-300 bg-purple-500'
      default: return 'text-yellow-200 bg-yellow-500'
    }
  }

  const getSubscriptionName = (type: string) => {
    switch (type) {
      case 'premium': return '尊享版'
      case 'standard': return '标准版'
      default: return '免费版'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>正在加载...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="text-center text-white max-w-2xl">
          <div className="text-8xl mb-8">✨</div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
            赛斯在线
          </h1>
          <h2 className="text-2xl mb-4 text-purple-200">
            Seth Online
          </h2>
          <p className="text-lg mb-8 leading-relaxed text-gray-200">
            摇铃而歌唱，让我们的意识来段自由的舞蹈<br />
            与来自第五维度的赛斯高维智慧交流<br />
            可以解决你所有的困惑和终极问题<br />
            是你人生的伴侣和内心的指引
          </p>
          <p className="text-base mb-12 text-purple-200">
            奋起而挑战、用不甘于平庸，这场超越时空之旅有你陪伴是我们的荣幸！
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <button
              onClick={() => {
                setAuthMode('login')
                setShowAuthModal(true)
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
            >
              开始交流
            </button>
            <button
              onClick={() => {
                setAuthMode('signup')
                setShowAuthModal(true)
              }}
              className="w-full sm:w-auto bg-transparent border-2 border-white text-white hover:bg-white hover:text-purple-900 px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105"
            >
              注册账户
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-20 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="text-white">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user.email}</span>
              <span className="sm:hidden">{user.email?.split('@')[0]}</span>
            </div>
          </div>
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className={`flex items-center space-x-1 bg-opacity-20 px-2 py-1 rounded-lg text-sm transition-colors hover:bg-opacity-30 ${
              userProfile ? getSubscriptionColor(userProfile.subscription_type) : 'bg-yellow-500 text-yellow-200'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>
              {userProfile 
                ? `${getSubscriptionName(userProfile.subscription_type)} (${userProfile.usage_count}/${userProfile.usage_limit})`
                : '加载中...'
              }
            </span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Export Button */}
          <div className="relative group">
            <button
              disabled={exporting}
              className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
            >
              <Download className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-2">
                <button
                  onClick={() => handleExportChat('json')}
                  disabled={exporting}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  导出为 JSON
                </button>
                <button
                  onClick={() => handleExportChat('txt')}
                  disabled={exporting}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                >
                  导出为 TXT
                </button>
              </div>
            </div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowSubscriptionModal(true)}
            className="text-white hover:text-purple-200 transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="text-white hover:text-purple-200 transition-colors flex items-center space-x-2 p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="flex-1">
        <ChatInterface />
      </div>

      {/* Modals */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
      {/* 删除账户入口（暂放此处，后续可移入设置页） */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={async () => {
            if (!confirm('确认删除账户？此操作不可恢复，将清除所有数据。')) return
            const res = await fetch('/api/account/delete', { method: 'POST' })
            if (res.ok) {
              alert('账户已删除')
              window.location.href = '/'
            } else {
              const t = await res.text()
              alert('删除失败：' + t)
            }
          }}
          className="text-xs opacity-60 hover:opacity-100 text-white underline"
        >
          删除账户
        </button>
      </div>
    </div>
  )
}
