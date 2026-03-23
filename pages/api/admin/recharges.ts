import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = cookie.parse(req.headers.cookie || '')
  const user = verifyToken(cookies.token || '')
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: '无权限' })
  }

  const supabase = getServiceSupabase()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('recharge_records')
      .select('*, agents(email, name)')
      .order('created_at', { ascending: false })

    if (error) return res.status(500).json({ error: error.message })
    return res.status(200).json(data)
  }

  if (req.method === 'PATCH') {
    const { id, status, note } = req.body

    if (!id || !['confirmed', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '参数错误' })
    }

    // Get recharge record
    const { data: record } = await supabase
      .from('recharge_records')
      .select('*')
      .eq('id', id)
      .eq('status', 'pending')
      .single()

    if (!record) {
      return res.status(404).json({ error: '记录不存在或已处理' })
    }

    // Update record
    await supabase
      .from('recharge_records')
      .update({
        status,
        confirmed_by: user.id,
        confirmed_at: new Date().toISOString(),
        note: note || null,
      })
      .eq('id', id)

    // If confirmed, add balance
    if (status === 'confirmed') {
      const { data: agent } = await supabase
        .from('agents')
        .select('balance')
        .eq('id', record.agent_id)
        .single()

      if (agent) {
        const newBalance = parseFloat(agent.balance) + parseFloat(record.amount)

        await supabase
          .from('agents')
          .update({ balance: newBalance, updated_at: new Date().toISOString() })
          .eq('id', record.agent_id)

        await supabase.from('balance_logs').insert({
          agent_id: record.agent_id,
          type: 'recharge',
          amount: parseFloat(record.amount),
          balance_after: newBalance,
          reference_id: id,
          note: `充值确认 - TxHash: ${record.tx_hash?.substring(0, 20)}...`,
        })
      }
    }

    return res.status(200).json({ success: true })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
