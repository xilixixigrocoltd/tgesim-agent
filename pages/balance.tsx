import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase, BalanceLog } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  logs: BalanceLog[]
  balance: number
}

export default function Balance({ user, logs, balance }: Props) {
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'recharge': return { label: '充值', color: 'text-green-600', sign: '+' }
      case 'order': return { label: '下单', color: 'text-red-500', sign: '-' }
      case 'refund': return { label: '退款', color: 'text-blue-500', sign: '+' }
      default: return { label: type, color: 'text-gray-600', sign: '' }
    }
  }

  return (
    <Layout title="余额记录 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">余额明细</h1>

        <Card className="text-center">
          <p className="text-sm text-gray-500 mb-1">当前余额</p>
          <p className="text-4xl font-bold text-orange-500">${balance.toFixed(2)}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">流水记录</h2>

          {logs.length === 0 ? (
            <p className="text-center text-gray-400 py-6">暂无记录</p>
          ) : (
            <div className="space-y-2">
              {logs.map(log => {
                const typeInfo = getTypeLabel(log.type)
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${typeInfo.color}`}>
                          {typeInfo.sign}${Math.abs(log.amount).toFixed(2)}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {typeInfo.label}
                        </span>
                      </div>
                      {log.note && (
                        <p className="text-xs text-gray-400 mt-0.5">{log.note}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(log.created_at).toLocaleString('zh-CN')}
                      </p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-xs text-gray-400">余额</p>
                      <p className="text-sm font-medium text-gray-700">${log.balance_after.toFixed(2)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: agent } = await supabase
    .from('agents')
    .select('balance')
    .eq('id', user.id)
    .single()

  const { data: logs } = await supabase
    .from('balance_logs')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return {
    props: {
      user,
      balance: agent?.balance || 0,
      logs: logs || [],
    },
  }
})
