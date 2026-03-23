import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase, InviteCode } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  codes: any[]
}

export default function AdminInvites({ user, codes: initialCodes }: Props) {
  const [codes, setCodes] = useState(initialCodes)
  const [generating, setGenerating] = useState(false)
  const [count, setCount] = useState(1)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const generate = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/admin/invites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      })
      if (res.ok) {
        const data = await res.json()
        setCodes([...data.codes, ...codes])
      }
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const availableCodes = codes.filter(c => !c.used_by)
  const usedCodes = codes.filter(c => c.used_by)

  return (
    <Layout title="邀请码管理 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">邀请码管理</h1>

        {/* Generate */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">生成邀请码</h2>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">数量</label>
              <input
                type="number"
                value={count}
                onChange={e => setCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                min="1"
                max="20"
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={generate}
                disabled={generating}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {generating ? '生成中...' : '生成'}
              </button>
            </div>
          </div>
        </Card>

        {/* Available Codes */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            可用邀请码
            <span className="ml-2 text-sm font-normal text-gray-500">({availableCodes.length}个)</span>
          </h2>

          {availableCodes.length === 0 ? (
            <p className="text-center text-gray-400 py-6">暂无可用邀请码</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableCodes.map(code => (
                <div key={code.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                  <span className="font-mono text-sm text-gray-800 font-semibold">{code.code}</span>
                  <button
                    onClick={() => copyCode(code.id, code.code)}
                    className="ml-2 px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-600 text-xs rounded-lg transition-colors"
                  >
                    {copiedId === code.id ? '✓ 已复制' : '复制'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Used Codes */}
        {usedCodes.length > 0 && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              已使用
              <span className="ml-2 text-sm font-normal text-gray-500">({usedCodes.length}个)</span>
            </h2>
            <div className="space-y-2">
              {usedCodes.map(code => (
                <div key={code.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <span className="font-mono text-sm text-gray-500">{code.code}</span>
                    {code.agents && (
                      <p className="text-xs text-gray-400 mt-0.5">使用者: {code.agents.email}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="default">已使用</Badge>
                    {code.used_at && (
                      <p className="text-xs text-gray-400 mt-1">{new Date(code.used_at).toLocaleDateString('zh-CN')}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: codes } = await supabase
    .from('invite_codes')
    .select('*, agents:used_by(email)')
    .order('created_at', { ascending: false })

  return {
    props: { user, codes: codes || [] },
  }
}, { requireAdmin: true })
