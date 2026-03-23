import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase, RechargeRecord } from '@/lib/supabase'

const USDT_ADDRESS = 'TBuhpRpFPV1HkdfaPEdxsKgTE43jV911rL'

type Props = {
  user: JWTPayload
  records: RechargeRecord[]
}

export default function Recharge({ user, records }: Props) {
  const [amount, setAmount] = useState('')
  const [txHash, setTxHash] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(USDT_ADDRESS)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!amount || parseFloat(amount) <= 0) {
      setError('请输入有效金额')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/agent/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), txHash }),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || '提交失败')
      } else {
        setSuccess('充值申请已提交，等待管理员确认')
        setAmount('')
        setTxHash('')
        setTimeout(() => window.location.reload(), 2000)
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success">已确认</Badge>
      case 'rejected': return <Badge variant="danger">已拒绝</Badge>
      default: return <Badge variant="warning">待确认</Badge>
    }
  }

  return (
    <Layout title="充值 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">充值</h1>

        {/* USDT Address */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">USDT 收款地址（TRC20）</h2>
          <div className="bg-orange-50 rounded-xl p-4 mb-3">
            <p className="text-xs text-gray-500 mb-2">收款地址</p>
            <p className="font-mono text-sm text-gray-800 break-all">{USDT_ADDRESS}</p>
          </div>
          <button
            onClick={copyAddress}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm"
          >
            {copied ? '✓ 已复制' : '复制地址'}
          </button>
          <p className="text-xs text-gray-400 mt-3 text-center">
            ⚠️ 仅支持 TRC20 网络，转账后提交 TxHash 确认
          </p>
        </Card>

        {/* Submit Form */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">提交充值记录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                充值金额（USDT） <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="100"
                min="1"
                step="0.01"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                交易 TxHash <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={txHash}
                onChange={e => setTxHash(e.target.value)}
                placeholder="区块链交易哈希"
                required
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? '提交中...' : '提交充值申请'}
            </button>
          </form>
        </Card>

        {/* History */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">充值记录</h2>

          {records.length === 0 ? (
            <p className="text-center text-gray-400 py-6">暂无充值记录</p>
          ) : (
            <div className="space-y-3">
              {records.map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(record.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(record.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    {record.tx_hash && (
                      <p className="text-xs text-gray-400 font-mono truncate w-40">{record.tx_hash}</p>
                    )}
                    {record.note && (
                      <p className="text-xs text-gray-500 mt-1">{record.note}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${record.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: records } = await supabase
    .from('recharge_records')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return {
    props: { user, records: records || [] },
  }
})
