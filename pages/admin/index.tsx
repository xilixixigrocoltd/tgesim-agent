import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  stats: {
    totalAgents: number
    activeAgents: number
    pendingAgents: number
    pendingRecharges: number
    totalBalance: number
    totalOrders: number
    completedOrders: number
  }
  recentRecharges: any[]
  recentOrders: any[]
}

export default function AdminDashboard({ user, stats, recentRecharges, recentOrders }: Props) {
  return (
    <Layout title="管理后台 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
          <p className="text-gray-500 mt-1">tgesim 代理商管理系统</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <p className="text-2xl font-bold text-gray-800">{stats.totalAgents}</p>
            <p className="text-xs text-gray-500 mt-1">总代理商</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-green-600">{stats.activeAgents}</p>
            <p className="text-xs text-gray-500 mt-1">活跃代理商</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-yellow-500">{stats.pendingAgents}</p>
            <p className="text-xs text-gray-500 mt-1">待审核</p>
          </Card>
          <Card className="text-center">
            <p className="text-2xl font-bold text-orange-500">{stats.pendingRecharges}</p>
            <p className="text-xs text-gray-500 mt-1">待确认充值</p>
          </Card>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">代理商总余额</p>
            <p className="text-2xl font-bold text-orange-500">${stats.totalBalance?.toFixed(2)}</p>
          </Card>
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">总订单数</p>
            <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/admin/agents">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <p className="text-3xl mb-2">👥</p>
                <p className="font-medium text-gray-800">代理商管理</p>
                {stats.pendingAgents > 0 && (
                  <p className="text-xs text-red-500 mt-1">{stats.pendingAgents} 待审核</p>
                )}
              </div>
            </Card>
          </Link>
          <Link href="/admin/recharges">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <p className="text-3xl mb-2">💰</p>
                <p className="font-medium text-gray-800">充值审核</p>
                {stats.pendingRecharges > 0 && (
                  <p className="text-xs text-red-500 mt-1">{stats.pendingRecharges} 待处理</p>
                )}
              </div>
            </Card>
          </Link>
          <Link href="/admin/invites">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="text-center">
                <p className="text-3xl mb-2">🎟️</p>
                <p className="font-medium text-gray-800">邀请码管理</p>
              </div>
            </Card>
          </Link>
        </div>

        {/* Recent Recharges */}
        {recentRecharges.length > 0 && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">最新充值申请</h2>
              <Link href="/admin/recharges" className="text-sm text-orange-500 hover:underline">查看全部</Link>
            </div>
            <div className="space-y-2">
              {recentRecharges.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.agents?.email}</p>
                    <p className="text-xs text-gray-400">{new Date(r.created_at).toLocaleString('zh-CN')}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+${r.amount}</p>
                    <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-0.5 rounded-full">待确认</span>
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

  const [
    { count: totalAgents },
    { count: activeAgents },
    { count: pendingAgents },
    { count: pendingRecharges },
    { data: balanceData },
    { count: totalOrders },
    { data: recentRecharges },
  ] = await Promise.all([
    supabase.from('agents').select('*', { count: 'exact', head: true }).neq('role', 'admin'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'active').neq('role', 'admin'),
    supabase.from('agents').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('recharge_records').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('agents').select('balance').neq('role', 'admin'),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('recharge_records').select('*, agents(email)').eq('status', 'pending').order('created_at', { ascending: false }).limit(5),
  ])

  const totalBalance = (balanceData || []).reduce((sum: number, a: any) => sum + (a.balance || 0), 0)

  return {
    props: {
      user,
      stats: {
        totalAgents: totalAgents || 0,
        activeAgents: activeAgents || 0,
        pendingAgents: pendingAgents || 0,
        pendingRecharges: pendingRecharges || 0,
        totalBalance,
        totalOrders: totalOrders || 0,
        completedOrders: 0,
      },
      recentRecharges: recentRecharges || [],
      recentOrders: [],
    },
  }
}, { requireAdmin: true })
