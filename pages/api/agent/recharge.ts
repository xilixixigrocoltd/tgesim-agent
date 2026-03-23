import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { verifyToken } from '@/lib/auth'
import cookie from 'cookie'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const cookies = cookie.parse(req.headers.cookie || '')
  const user = verifyToken(cookies.token || '')
  if (!user) return res.status(401).json({ error: '未授权' })
  if (user.status !== 'active') return res.status(403).json({ error: '账号未激活' })

  const { amount, txHash } = req.body

  if (!amount || amount <= 0) {
    return res.status(400).json({ error: '请输入有效金额' })
  }

  if (!txHash || !txHash.trim()) {
    return res.status(400).json({ error: '请输入交易 TxHash' })
  }

  const supabase = getServiceSupabase()

  const { data, error } = await supabase
    .from('recharge_records')
    .insert({
      agent_id: user.id,
      amount: parseFloat(amount),
      tx_hash: txHash.trim(),
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Recharge error:', error)
    return res.status(500).json({ error: '提交失败' })
  }

  return res.status(201).json({ success: true, record: data })
}
