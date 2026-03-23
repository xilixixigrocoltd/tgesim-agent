import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import { placeOrder } from '@/lib/tgesim-api'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const cookies = cookie.parse(req.headers.cookie || '')
  const user = verifyToken(cookies.token || '')
  if (!user) return res.status(401).json({ error: '未授权' })
  if (user.status !== 'active') return res.status(403).json({ error: '账号未激活' })

  const { productId, productName, customerEmail, amount } = req.body

  if (!productId || !customerEmail || !amount) {
    return res.status(400).json({ error: '参数不完整' })
  }

  const supabase = getServiceSupabase()

  // Check balance
  const { data: agent } = await supabase
    .from('agents')
    .select('balance')
    .eq('id', user.id)
    .single()

  if (!agent || agent.balance < amount) {
    return res.status(400).json({ error: '余额不足，请先充值' })
  }

  // Create pending order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      agent_id: user.id,
      product_id: productId,
      product_name: productName,
      customer_email: customerEmail,
      amount: parseFloat(amount),
      status: 'pending',
    })
    .select()
    .single()

  if (orderError || !order) {
    return res.status(500).json({ error: '创建订单失败' })
  }

  // Deduct balance
  const newBalance = parseFloat(agent.balance) - parseFloat(amount)

  await supabase
    .from('agents')
    .update({ balance: newBalance, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  // Log balance change
  await supabase.from('balance_logs').insert({
    agent_id: user.id,
    type: 'order',
    amount: -parseFloat(amount),
    balance_after: newBalance,
    reference_id: order.id,
    note: `下单: ${productName || productId}`,
  })

  // Call tgesim API
  try {
    const tgesimOrder = await placeOrder({
      product_id: productId,
      customer_email: customerEmail,
    })

    // Update order with eSIM details
    await supabase
      .from('orders')
      .update({
        b2b_order_number: tgesimOrder.order_number,
        esim_iccid: tgesimOrder.iccid || null,
        esim_qr_code: tgesimOrder.qr_code || null,
        esim_activation_code: tgesimOrder.activation_code || null,
        status: 'completed',
      })
      .eq('id', order.id)

    return res.status(200).json({
      success: true,
      orderId: order.id,
      orderNumber: tgesimOrder.order_number,
    })
  } catch (e: any) {
    // Order failed - refund balance
    await supabase
      .from('agents')
      .update({ balance: agent.balance, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    await supabase.from('balance_logs').insert({
      agent_id: user.id,
      type: 'refund',
      amount: parseFloat(amount),
      balance_after: agent.balance,
      reference_id: order.id,
      note: `退款: 下单失败 - ${productName || productId}`,
    })

    await supabase
      .from('orders')
      .update({ status: 'failed' })
      .eq('id', order.id)

    return res.status(500).json({ error: `下单失败: ${e.message}` })
  }
}
