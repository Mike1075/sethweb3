'use client'

import { useState } from 'react'
import { X, Crown, Check, Star } from 'lucide-react'
// import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
  const [loading, setLoading] = useState(false)
  // const { user } = useAuth()

  const plans = [
    {
      id: 'free',
      name: '免费版',
      price: '免费',
      description: '体验赛斯智慧',
      features: [
        '15次对话机会',
        '基础AI问答',
        '简单对话记录',
      ],
      limitations: [
        '使用次数有限',
        '无法导出聊天记录',
        '不支持高级功能',
      ],
      current: true,
    },
    {
      id: 'standard',
      name: '标准版',
      price: '$19.99/月',
      description: '深度智慧交流',
      features: [
        '150次/月对话',
        '完整对话历史',
        '聊天记录导出',
        '优先响应速度',
        '高级AI模型',
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: '尊享版',
      price: '$49.99/月',
      description: '无限制高维对话',
      features: [
        '500次/月对话',
        '无限对话历史',
        '多格式导出',
        '最快响应速度',
        '顶级AI模型',
        '专属客服支持',
        '高级个性化设置',
      ],
    },
  ]

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') return
    
    setLoading(true)
    try {
      // 这里将来集成 Stripe 支付
      alert(`即将跳转到 ${planId} 套餐的支付页面`)
      // 暂时模拟支付流程
      setTimeout(() => {
        alert('支付功能正在开发中，敬请期待！')
        setLoading(false)
      }, 2000)
    } catch (error) {
      console.error('订阅失败:', error)
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div>
            <h2 className="text-2xl font-bold">选择你的订阅计划</h2>
            <p className="text-purple-100 mt-1">解锁更多高维智慧交流机会</p>
          </div>
          <button
            onClick={onClose}
            className="text-purple-100 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Plans */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative border rounded-lg p-6 ${
                  plan.popular
                    ? 'border-purple-500 shadow-lg scale-105'
                    : plan.current
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      推荐
                    </span>
                  </div>
                )}

                {plan.current && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gray-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      当前计划
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="flex items-center justify-center mb-2">
                    <Crown className={`w-8 h-8 ${
                      plan.id === 'premium' 
                        ? 'text-yellow-500' 
                        : plan.id === 'standard' 
                        ? 'text-purple-500' 
                        : 'text-gray-400'
                    }`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{plan.description}</p>
                  <div className="text-3xl font-bold text-gray-800 mb-2">
                    {plan.price}
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && (
                    <>
                      <hr className="my-3" />
                      {plan.limitations.map((limitation, index) => (
                        <div key={index} className="flex items-center">
                          <X className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                          <span className="text-gray-500 text-sm">{limitation}</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading || plan.current}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                    plan.current
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-900 text-white'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                  ) : plan.current ? (
                    '当前计划'
                  ) : plan.id === 'free' ? (
                    '免费使用'
                  ) : (
                    '立即升级'
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ */}
          <div className="mt-12 border-t pt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">常见问题</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">如何取消订阅？</h4>
                <p className="text-gray-600 text-sm">您可以随时在账户设置中取消订阅，取消后将在当前计费周期结束时生效。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">支持哪些支付方式？</h4>
                <p className="text-gray-600 text-sm">我们支持信用卡、微信支付、支付宝等多种支付方式。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">使用次数如何计算？</h4>
                <p className="text-gray-600 text-sm">每次向赛斯发送消息算作一次使用，每月重置计数。</p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">数据安全吗？</h4>
                <p className="text-gray-600 text-sm">您的所有对话数据都经过加密存储，我们严格保护您的隐私。</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}