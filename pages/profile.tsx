import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  apiKey: string
  balance: number
}

export default function Profile({ user, apiKey, balance }: Props) {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <Layout title="个人资料 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">个人资料</h1>

        {/* Profile Info */}
        <Card>
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl font-bold text-orange-500 mr-4">
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{user.name || '未设置名称'}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full">
                {user.role === 'admin' ? '管理员' : '代理商'}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">账户余额</span>
              <span className="text-sm font-bold text-orange-500">${balance.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">邮箱</span>
              <span className="text-sm text-gray-800">{user.email}</span>
            </div>
            <div className="flex justify-between py-3 border-b border-gray-100">
              <span className="text-sm text-gray-500">账号状态</span>
              <span className="text-sm text-green-600 font-medium">正常</span>
            </div>
          </div>
        </Card>

        {/* API Key */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">API Key</h2>
          <p className="text-sm text-gray-500 mb-3">
            用于调用 tgesim Agent API。请妥善保管，不要泄露给他人。
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-gray-500">API Key</p>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-xs text-orange-500 hover:underline"
              >
                {showKey ? '隐藏' : '显示'}
              </button>
            </div>
            <p className="font-mono text-sm text-gray-800 break-all">
              {showKey ? apiKey : apiKey.substring(0, 10) + '••••••••••••••••••••'}
            </p>
          </div>

          <button
            onClick={copyKey}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {copied ? '✓ 已复制' : '复制 API Key'}
          </button>
        </Card>

        {/* Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">账户操作</h2>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg transition-colors text-sm"
          >
            退出登录
          </button>
        </Card>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: agent } = await supabase
    .from('agents')
    .select('api_key, balance')
    .eq('id', user.id)
    .single()

  return {
    props: {
      user,
      apiKey: agent?.api_key || '',
      balance: agent?.balance || 0,
    },
  }
})
