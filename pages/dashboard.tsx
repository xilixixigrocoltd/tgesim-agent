import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  balance: number
  orderCount: number
  recentOrders: any[]
  agentType: string
  discountRate: number
  pendingCommission: number
  referralCode: string
}

export default function Dashboard({ user, balance, orderCount, recentOrders, agentType, discountRate, pendingCommission, referralCode }: Props) {
  const isReseller = agentType === 'reseller'

  const quickActions = [
    { href: '/products', label: '浏览产品', icon: '🛍️', desc: isReseller ? '查看折扣进货价' : '查看产品及预计佣金' },
    ...(isReseller ? [{ href: '/recharge', label: '充值', icon: '💰', desc: '提交 USDT 充值' }] : []),
    { href: '/orders', label: '我的订单', icon: '📋', desc: '查看历史订单' },
    { href: '/balance', label: '余额明细', icon: '📊', desc: '查看收支流水' },
    { href: '/profile', label: '我的资料', icon: '👤', desc: 'API Key 等信息' },
  ]

  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}?ref=${referralCode}`
    : `https://tgesim.com?ref=${referralCode}`

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralUrl)
  }

  return (
    <Layout title="控制台 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        {/* Welcome */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              你好，{user.name || user.email.split('@')[0]} 👋
            </h1>
            <p className="text-gray-500 mt-1">欢迎回到 tgesim 代理商后台</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isReseller
              ? 'bg-purple-100 text-purple-700'
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isReseller ? '💰 充值代理' : '🔗 推广代理'}
          </span>
        </div>

        {/* Stats - Reseller */}
        {isReseller && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">账户余额</p>
              <p className="text-3xl font-bold text-orange-500">${balance.toFixed(2)}</p>
              <Link href="/recharge" className="text-xs text-orange-500 hover:underline mt-1 block">
                立即充值 →
              </Link>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">进货折扣</p>
              <p className="text-3xl font-bold text-purple-500">{Math.round((1 - discountRate) * 100 / discountRate * 100) / 100}%</p>
              <p className="text-xs text-gray-400 mt-1">低于零售价</p>
            </Card>
          </div>
        )}

        {/* Stats - Affiliate */}
        {!isReseller && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">待结佣金</p>
              <p className="text-3xl font-bold text-green-500">${pendingCommission.toFixed(2)}</p>
              <p className="text-xs text-gray-400 mt-1">USDT结算</p>
            </Card>
            <Card className="text-center">
              <p className="text-sm text-gray-500 mb-1">总订单数</p>
              <p className="text-3xl font-bold text-gray-800">{orderCount}</p>
              <Link href="/orders" className="text-xs text-orange-500 hover:underline mt-1 block">
                查看订单 →
              </Link>
            </Card>
          </div>
        )}

        {isReseller && (
          <Card className="text-center">
            <p className="text-sm text-gray-500 mb-1">总订单数</p>
            <p className="text-3xl font-bold text-gray-800">{orderCount}</p>
            <Link href="/orders" className="text-xs text-orange-500 hover:underline mt-1 block">
              查看订单 →
            </Link>
          </Card>
        )}

        {/* Affiliate Referral Link */}
        {!isReseller && (
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">我的推荐链接</h2>
            <p className="text-xs text-gray-500 mb-2">分享此链接，客户购买后系统自动结佣（利润的 A类80% / B类70% / C类60%）</p>
            <div className="flex items-center gap-2">
              <input
                readOnly
                value={referralUrl}
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 truncate"
              />
              <button
                onClick={handleCopyReferral}
                className="px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-lg transition-colors whitespace-nowrap"
              >
                复制
              </button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快捷操作</h2>
          <div className="grid grid-cols-1 gap-3">
            {quickActions.map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center p-3 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group"
              >
                <span className="text-2xl mr-3">{action.icon}</span>
                <div>
                  <p className="font-medium text-gray-800 group-hover:text-orange-600">{action.label}</p>
                  <p className="text-xs text-gray-500">{action.desc}</p>
                </div>
                <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </Card>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">最近订单</h2>
              <Link href="/orders" className="text-sm text-orange-500 hover:underline">查看全部</Link>
            </div>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{order.product_name || `产品 #${order.product_id}`}</p>
                    <p className="text-xs text-gray-500">{order.customer_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">${order.amount}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-600' :
                      order.status === 'failed' ? 'bg-red-100 text-red-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {order.status === 'completed' ? '已完成' : order.status === 'failed' ? '失败' : '处理中'}
                    </span>
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

  const { data: agent } = await supabase
    .from('agents')
    .select('balance, agent_type, discount_rate, referral_code')
    .eq('id', user.id)
    .single()

  const { count: orderCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('agent_id', user.id)

  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, product_id, product_name, customer_email, amount, status')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  // Pending commission for affiliate
  let pendingCommission = 0
  if (agent?.agent_type === 'affiliate') {
    const { data: commissions } = await supabase
      .from('commissions')
      .select('commission_amount')
      .eq('agent_id', user.id)
      .eq('status', 'pending')

    pendingCommission = (commissions || []).reduce((sum: number, c: any) => sum + (c.commission_amount || 0), 0)
  }

  return {
    props: {
      user,
      balance: agent?.balance || 0,
      orderCount: orderCount || 0,
      recentOrders: recentOrders || [],
      agentType: agent?.agent_type || 'affiliate',
      discountRate: agent?.discount_rate || 1.0,
      pendingCommission,
      referralCode: agent?.referral_code || user.id.slice(0, 8),
    },
  }
})
