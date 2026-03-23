import { useState } from 'react'
import { GetServerSideProps } from 'next'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getServiceSupabase, Order } from '@/lib/supabase'

type Props = {
  user: JWTPayload
  orders: Order[]
}

export default function Orders({ user, orders }: Props) {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge variant="success">已完成</Badge>
      case 'failed': return <Badge variant="danger">失败</Badge>
      default: return <Badge variant="warning">处理中</Badge>
    }
  }

  return (
    <Layout title="我的订单 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">我的订单</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-lg">暂无订单</p>
            <a href="/products" className="text-orange-500 hover:underline text-sm mt-2 block">
              去下单 →
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => (
              <Card key={order.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedOrder(order)}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(order.status)}
                      <span className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <p className="font-medium text-gray-800">{order.product_name || `产品 #${order.product_id}`}</p>
                    <p className="text-sm text-gray-500">{order.customer_email}</p>
                    {order.esim_iccid && (
                      <p className="text-xs text-gray-400 mt-1">ICCID: {order.esim_iccid}</p>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-bold text-gray-800">${order.amount}</p>
                    <p className="text-xs text-orange-500 mt-1">查看详情 →</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">订单详情</h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">状态</span>
                {getStatusBadge(selectedOrder.status)}
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">产品</span>
                <span className="text-sm font-medium text-gray-800">{selectedOrder.product_name || `#${selectedOrder.product_id}`}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">客户邮箱</span>
                <span className="text-sm text-gray-800">{selectedOrder.customer_email}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">金额</span>
                <span className="text-sm font-bold text-orange-500">${selectedOrder.amount}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">下单时间</span>
                <span className="text-sm text-gray-800">{new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</span>
              </div>
              {selectedOrder.b2b_order_number && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">订单号</span>
                  <span className="text-xs text-gray-600 font-mono">{selectedOrder.b2b_order_number}</span>
                </div>
              )}
              {selectedOrder.esim_iccid && (
                <div className="py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">ICCID</p>
                  <p className="text-sm font-mono bg-gray-50 p-2 rounded">{selectedOrder.esim_iccid}</p>
                </div>
              )}
              {selectedOrder.esim_activation_code && (
                <div className="py-2 border-b border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">激活码</p>
                  <p className="text-xs font-mono bg-gray-50 p-2 rounded break-all">{selectedOrder.esim_activation_code}</p>
                </div>
              )}
              {selectedOrder.esim_qr_code && (
                <div className="py-2">
                  <p className="text-sm text-gray-500 mb-2">eSIM 二维码</p>
                  <img src={selectedOrder.esim_qr_code} alt="eSIM QR Code" className="w-48 h-48 mx-auto border border-gray-200 rounded-xl" />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const supabase = getServiceSupabase()

  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('agent_id', user.id)
    .order('created_at', { ascending: false })

  return {
    props: { user, orders: orders || [] },
  }
})
