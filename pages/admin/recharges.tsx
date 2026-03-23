import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  records: any[]
}

export default function AdminRecharges({ user, records: initialRecords }: Props) {
  const [records, setRecords] = useState(initialRecords)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')
  const [noteModal, setNoteModal] = useState<{ id: string; action: string } | null>(null)
  const [note, setNote] = useState('')

  const handleAction = async (id: string, action: 'confirmed' | 'rejected', noteText?: string) => {
    setLoading(id)
    try {
      const res = await fetch('/api/admin/recharges', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: action, note: noteText }),
      })
      if (res.ok) {
        setRecords(records.map(r => r.id === id ? { ...r, status: action } : r))
      }
    } finally {
      setLoading(null)
      setNoteModal(null)
      setNote('')
    }
  }

  const filtered = filter === 'all' ? records : records.filter(r => r.status === filter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed': return <Badge variant="success">已确认</Badge>
      case 'rejected': return <Badge variant="danger">已拒绝</Badge>
      default: return <Badge variant="warning">待确认</Badge>
    }
  }

  return (
    <Layout title="充值审核 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">充值审核</h1>

        <div className="flex gap-2">
          {['pending', 'confirmed', 'rejected', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待确认' : f === 'confirmed' ? '已确认' : '已拒绝'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(record => (
            <Card key={record.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(record.status)}
                    <span className="text-xs text-gray-400">
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </span>
                  </div>
                  <p className="font-bold text-2xl text-green-600 mb-1">${record.amount}</p>
                  <p className="text-sm text-gray-600">{record.agents?.email}</p>
                  {record.tx_hash && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">TxHash:</p>
                      <p className="text-xs font-mono text-gray-700 break-all bg-gray-50 p-2 rounded mt-1">
                        {record.tx_hash}
                      </p>
                    </div>
                  )}
                  {record.note && (
                    <p className="text-xs text-gray-500 mt-2">备注: {record.note}</p>
                  )}
                </div>

                {record.status === 'pending' && (
                  <div className="ml-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleAction(record.id, 'confirmed')}
                      disabled={loading === record.id}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                    >
                      {loading === record.id ? '...' : '确认到账'}
                    </button>
                    <button
                      onClick={() => {
                        setNoteModal({ id: record.id, action: 'rejected' })
                      }}
                      disabled={loading === record.id}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium rounded-lg disabled:opacity-50"
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">💰</p>
              <p>暂无充值记录</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {noteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">拒绝原因</h3>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="请输入拒绝原因（可选）"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 h-24 resize-none"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setNoteModal(null); setNote('') }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
              >
                取消
              </button>
              <button
                onClick={() => handleAction(noteModal.id, 'rejected', note)}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: records } = await supabase
    .from('recharge_records')
    .select('*, agents(email, name)')
    .order('created_at', { ascending: false })

  return {
    props: { user, records: records || [] },
  }
}, { requireAdmin: true })
