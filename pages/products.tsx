import { useState } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import Layout from '@/components/Layout'
import { Card } from '@/components/ui/Card'
import { withAuth } from '@/lib/middleware'
import { JWTPayload } from '@/lib/auth'
import { getProducts, TgesimProduct } from '@/lib/tgesim-api'

type Props = {
  user: JWTPayload
  products: TgesimProduct[]
  error?: string
  balance: number
}

export default function Products({ user, products, error, balance }: Props) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<TgesimProduct | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')
  const [search, setSearch] = useState('')

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  const handleOrder = async () => {
    if (!selectedProduct || !customerEmail) return
    setOrdering(true)
    setOrderError('')
    setOrderSuccess('')

    try {
      const res = await fetch('/api/agent/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          customerEmail,
          amount: selectedProduct.price,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setOrderError(data.error || '下单失败')
      } else {
        setOrderSuccess(`下单成功！订单号: ${data.orderId}`)
        setSelectedProduct(null)
        setCustomerEmail('')
        setTimeout(() => router.push('/orders'), 2000)
      }
    } catch {
      setOrderError('网络错误，请重试')
    } finally {
      setOrdering(false)
    }
  }

  return (
    <Layout title="产品列表 - tgesim Agent Portal" user={user}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">产品列表</h1>
          <div className="text-sm text-gray-500">
            余额: <span className="font-semibold text-orange-500">${balance.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="搜索产品..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            获取产品失败: {error}
          </div>
        )}

        {orderError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {orderError}
          </div>
        )}

        {orderSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-600">
            {orderSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(product => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="text-xl font-bold text-orange-500">${product.price}</p>
                  {product.currency && product.currency !== 'USD' && (
                    <p className="text-xs text-gray-400">{product.currency}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {product.data_gb && (
                  <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-lg">
                    {product.data_gb}GB
                  </span>
                )}
                {product.validity_days && (
                  <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg">
                    {product.validity_days}天
                  </span>
                )}
                {product.countries?.slice(0, 3).map(c => (
                  <span key={c} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg">
                    {c}
                  </span>
                ))}
                {(product.countries?.length || 0) > 3 && (
                  <span className="px-2 py-1 bg-gray-50 text-gray-400 text-xs rounded-lg">
                    +{product.countries!.length - 3}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setSelectedProduct(product)
                  setOrderError('')
                  setOrderSuccess('')
                }}
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors"
              >
                立即下单
              </button>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>暂无产品</p>
          </div>
        )}

        {/* Order Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">确认下单</h3>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                <p className="text-2xl font-bold text-orange-500 mt-1">${selectedProduct.price}</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  客户邮箱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-400 mt-1">eSIM 将发送到此邮箱</p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                <p className="text-sm text-yellow-700">
                  下单后将从余额扣除 <strong>${selectedProduct.price}</strong>，当前余额 <strong>${balance.toFixed(2)}</strong>
                </p>
              </div>

              {balance < selectedProduct.price && (
                <div className="bg-red-50 rounded-xl p-3 mb-4">
                  <p className="text-sm text-red-600">余额不足，请先充值</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors text-sm"
                >
                  取消
                </button>
                <button
                  onClick={handleOrder}
                  disabled={ordering || balance < selectedProduct.price || !customerEmail}
                  className="flex-1 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {ordering ? '处理中...' : '确认下单'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps = withAuth(async (ctx, user) => {
  const { getServiceSupabase } = await import('@/lib/supabase')
  const supabase = getServiceSupabase()

  const { data: agent } = await supabase
    .from('agents')
    .select('balance')
    .eq('id', user.id)
    .single()

  let products: TgesimProduct[] = []
  let error: string | undefined

  try {
    // 从 Supabase miniapp_products 表读取（1984个上架产品，已过滤亏本和冷门）
    const { data, error: dbError } = await supabase
      .from('miniapp_products')
      .select('*')
      .eq('is_active', true)
      .order('profit_rate', { ascending: false })
      .limit(500)

    if (dbError) throw new Error(dbError.message)
    products = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      description: `${p.country} | ${p.type} | 利润率${p.profit_rate}%`,
      price: p.price,
      currency: 'USD',
      data_gb: p.data_size ? p.data_size / 1024 : 0,
      validity_days: p.valid_days,
      countries: [p.country],
      country: p.country,
      type: p.type,
      profit_rate: p.profit_rate,
    }))
  } catch (e: any) {
    error = e.message || '获取产品失败'
  }

  return {
    props: {
      user,
      products,
      error: error || null,
      balance: agent?.balance || 0,
    },
  }
})
