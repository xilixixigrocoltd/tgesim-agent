import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase, Agent } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  agents: Agent[]
}

export default function AdminAgents({ user, agents: initialAgents }: Props) {
  const [agents, setAgents] = useState(initialAgents)
  const [loading, setLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const updateStatus = async (agentId: string, status: string) => {
    setLoading(agentId)
    try {
      const res = await fetch('/api/admin/agents', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, status }),
      })
      if (res.ok) {
        setAgents(agents.map(a => a.id === agentId ? { ...a, status: status as any } : a))
      }
    } finally {
      setLoading(null)
    }
  }

  const filtered = filter === 'all' ? agents : agents.filter(a => a.status === filter)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="success">活跃</Badge>
      case 'disabled': return <Badge variant="danger">已禁用</Badge>
      default: return <Badge variant="warning">待审核</Badge>
    }
  }

  return (
    <Layout title="代理商管理 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">代理商管理</h1>

        {/* Filter */}
        <div className="flex gap-2">
          {['all', 'pending', 'active', 'disabled'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f === 'all' ? '全部' : f === 'pending' ? '待审核' : f === 'active' ? '活跃' : '已禁用'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.map(agent => (
            <Card key={agent.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(agent.status)}
                    <span className="text-sm font-medium text-gray-800">{agent.name || '未设名称'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{agent.email}</p>
                  {agent.telegram && (
                    <p className="text-xs text-gray-400 mt-0.5">TG: {agent.telegram}</p>
                  )}
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-gray-500">
                      余额: <strong className="text-orange-500">${agent.balance?.toFixed(2) || '0.00'}</strong>
                    </span>
                    <span className="text-xs text-gray-500">
                      注册: {new Date(agent.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex flex-col gap-2">
                  {agent.status === 'pending' && (
                    <button
                      onClick={() => updateStatus(agent.id, 'active')}
                      disabled={loading === agent.id}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                    >
                      {loading === agent.id ? '...' : '通过审核'}
                    </button>
                  )}
                  {agent.status === 'active' && (
                    <button
                      onClick={() => updateStatus(agent.id, 'disabled')}
                      disabled={loading === agent.id}
                      className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium rounded-lg disabled:opacity-50"
                    >
                      禁用
                    </button>
                  )}
                  {agent.status === 'disabled' && (
                    <button
                      onClick={() => updateStatus(agent.id, 'active')}
                      disabled={loading === agent.id}
                      className="px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-600 text-xs font-medium rounded-lg disabled:opacity-50"
                    >
                      启用
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">👥</p>
              <p>暂无代理商</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: agents } = await supabase
    .from('agents')
    .select('*')
    .neq('role', 'admin')
    .order('created_at', { ascending: false })

  return {
    props: { user, agents: agents || [] },
  }
}, { requireAdmin: true })
