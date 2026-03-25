import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { GetServerSideProps } from 'next'
import { withGuest } from '@/lib/middleware'
import Head from 'next/head'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    telegram: '',
    inviteCode: '',
    agentType: 'affiliate',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('两次密码不一致')
      return
    }

    if (form.password.length < 8) {
      setError('密码至少8位')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          telegram: form.telegram,
          inviteCode: form.inviteCode,
          agentType: form.agentType,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '注册失败')
      } else {
        router.push('/pending')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>注册 - tgesim Agent Portal</title>
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">申请成为代理商</h1>
            <p className="text-gray-500 mt-1">需要管理员审核后激活</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Agent Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  代理模式 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`relative flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      form.agentType === 'affiliate'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="agentType"
                      value="affiliate"
                      checked={form.agentType === 'affiliate'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl mb-1">🔗</span>
                    <span className="font-semibold text-sm text-gray-800">推广代理</span>
                    <span className="text-xs text-gray-500 mt-1">零充值，分享链接赚佣金（利润80%）</span>
                    {form.agentType === 'affiliate' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </label>

                  <label
                    className={`relative flex flex-col p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                      form.agentType === 'reseller'
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="agentType"
                      value="reseller"
                      checked={form.agentType === 'reseller'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="text-xl mb-1">💰</span>
                    <span className="font-semibold text-sm text-gray-800">充值代理</span>
                    <span className="text-xs text-gray-500 mt-1">先充值，折扣进货，差价归自己</span>
                    {form.agentType === 'reseller' && (
                      <span className="absolute top-2 right-2 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </label>
                </div>
                {form.agentType === 'affiliate' && (
                  <p className="mt-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                    💡 推荐给初期代理：无需投入，分享专属链接，客户付款后系统自动结佣到USDT钱包
                  </p>
                )}
                {form.agentType === 'reseller' && (
                  <p className="mt-2 text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2">
                    💡 推荐给有资源的代理：充值后享受折扣进货价，自由定价，差价全归自己
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邀请码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="inviteCode"
                  value={form.inviteCode}
                  onChange={handleChange}
                  placeholder="请输入邀请码"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">姓名/公司名</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="可选"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telegram</label>
                <input
                  type="text"
                  name="telegram"
                  value={form.telegram}
                  onChange={handleChange}
                  placeholder="@username（可选）"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="至少8位"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  确认密码 <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="再次输入密码"
                  required
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-start gap-2 mt-4">
                <input 
                  type="checkbox" 
                  id="agree" 
                  checked={agreed} 
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-1 cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer">
                  我已阅读并同意 
                  <a href="/agreement" target="_blank" className="text-blue-500 hover:underline">《代理商合作协议》</a>
                  ，包括充值等级说明、退款政策、保密条款等内容。
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !agreed}
                className={`w-full py-2.5 font-medium rounded-lg transition-colors ${
                  agreed 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {loading ? '提交中...' : '提交申请'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-500">
              已有账号？{' '}
              <Link href="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = withGuest(async () => {
  return { props: {} }
})
