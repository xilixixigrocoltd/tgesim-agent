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
  agentType: string
  discountRate: number
}

export default function Products({ user, products, error, balance, agentType, discountRate }: Props) {
  const router = useRouter()
  const [selectedProduct, setSelectedProduct] = useState<TgesimProduct | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderError, setOrderError] = useState('')
  const [orderSuccess, setOrderSuccess] = useState('')
  const [search, setSearch] = useState('')

  const isReseller = agentType === 'reseller'

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  // 进货价 = 零售价 - 代理佣金（85%利润），同时不低于成本×1.05
  const getWholesalePrice = (retailPrice: number, costPrice: number) => {
    const profit = retailPrice - costPrice
    const commission = profit * 0.85 // 充值代理拿85%（A类）
    const resellerPrice = retailPrice - commission
    const minPrice = costPrice * 1.05
    return Math.max(resellerPrice, minPrice)
  }

  // 获取佣金（根据利润率分类）
  const getCommission = (retailPrice: number, costPrice: number, type: string) => {
    const profit = retailPrice - costPrice
    const profitRate = profit / retailPrice
    let rate = type === 'reseller'
      ? (profitRate >= 0.5 ? 0.85 : profitRate >= 0.3 ? 0.75 : 0.65)
      : (profitRate >= 0.5 ? 0.80 : profitRate >= 0.3 ? 0.70 : 0.60)
    return profit * rate
  }

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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">产品列表</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              isReseller ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isReseller ? '💰 充值代理视图' : '🔗 推广代理视图'}
            </span>
          </div>
          {isReseller && (
            <div className="text-sm text-gray-500">
              余额: <span className="font-semibold text-orange-500">${balance.toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Mode explanation */}
        {isReseller ? (
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-xl text-sm text-purple-700">
            显示折扣进货价（成本 ÷ {discountRate}）。下单后从余额扣除进货价，您可按任意零售价出售，差价全归您。
          </div>
        ) : (
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
            显示零售价及预计佣金。客户通过您的推荐链接购买后，系统自动按利润比例结佣（A类80% / B类70% / C类60%）。
          </div>
        )}

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
          {filtered.map(product => {
            const costPrice = (product as any).cost_price || product.price * 0.37
            const wholesalePrice = getWholesalePrice(product.price, costPrice)
            const profit = product.price - costPrice
            const estimatedCommission = getCommission(product.price, costPrice, agentType || 'affiliate')

            return (
              <Card key={product.id} className="hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    )}
                  </div>
                  <div className="text-right ml-4 flex-shrink-0">
                    {isReseller ? (
                      <>
                        <p className="text-xl font-bold text-purple-600">${wholesalePrice.toFixed(2)}</p>
                        <p className="text-xs text-gray-400 line-through">${product.price}</p>
                        <p className="text-xs text-green-600">省${(product.price - wholesalePrice).toFixed(2)}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xl font-bold text-orange-500">${product.price}</p>
                        <p className="text-xs text-green-600">+${estimatedCommission.toFixed(2)} 佣金</p>
                      </>
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
                  {isReseller && (
                    <span className="px-2 py-1 bg-purple-50 text-purple-600 text-xs rounded-lg font-medium">
                      利润空间 ${(product.price - wholesalePrice).toFixed(2)}+
                    </span>
                  )}
                  {!isReseller && (
                    <span className="px-2 py-1 bg-green-50 text-green-600 text-xs rounded-lg font-medium">
                      佣金 ${estimatedCommission.toFixed(2)}(A类)
                    </span>
                  )}
                </div>

                {isReseller ? (
                  <button
                    onClick={() => {
                      setSelectedProduct(product)
                      setOrderError('')
                      setOrderSuccess('')
                    }}
                    className="w-full py-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    以 ${wholesalePrice.toFixed(2)} 进货
                  </button>
                ) : (
                  <div className="w-full py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg text-center">
                    通过推荐链接销售
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && !error && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📦</p>
            <p>暂无产品</p>
          </div>
        )}

        {/* Order Modal - Reseller only */}
        {selectedProduct && isReseller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">确认下单</h3>

              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="font-medium text-gray-800">{selectedProduct.name}</p>
                {(() => {
                  const costPrice = (selectedProduct as any).cost_price || selectedProduct.price * 0.37
                  const wp = getWholesalePrice(selectedProduct.price, costPrice)
                  return (
                    <>
                      <p className="text-2xl font-bold text-purple-600 mt-1">${wp.toFixed(2)} <span className="text-sm font-normal text-gray-400">进货价</span></p>
                      <p className="text-sm text-gray-500 mt-1">零售价 ${selectedProduct.price}，利润空间 ${(selectedProduct.price - wp).toFixed(2)}+</p>
                    </>
                  )
                })()}
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

              {(() => {
                const costPrice = (selectedProduct as any).cost_price || selectedProduct.price * 0.37
                const wp = getWholesalePrice(selectedProduct.price, costPrice)
                return (
                  <>
                    <div className="bg-yellow-50 rounded-xl p-3 mb-4">
                      <p className="text-sm text-yellow-700">
                        下单后将从余额扣除 <strong>${wp.toFixed(2)}</strong>，当前余额 <strong>${balance.toFixed(2)}</strong>
                      </p>
                    </div>

                    {balance < wp && (
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
                        disabled={ordering || balance < wp || !customerEmail}
                        className="flex-1 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                      >
                        {ordering ? '处理中...' : '确认下单'}
                      </button>
                    </div>
                  </>
                )
              })()}
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
    .select('balance, agent_type, discount_rate')
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
      cost_price: p.cost_price || p.price * 0.37,
    } as any))
  } catch (e: any) {
    error = e.message || '获取产品失败'
  }

  return {
    props: {
      user,
      products,
      error: error || null,
      balance: agent?.balance || 0,
      agentType: agent?.agent_type || 'affiliate',
      discountRate: agent?.discount_rate || 1.0,
    },
  }
})
