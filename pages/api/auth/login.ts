import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { comparePassword, signToken, setCookieToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: '请填写邮箱和密码' })
  }

  const supabase = getServiceSupabase()
  const { data: agent } = await supabase
    .from('agents')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!agent) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }

  const validPassword = await comparePassword(password, agent.password_hash)
  if (!validPassword) {
    return res.status(401).json({ error: '邮箱或密码错误' })
  }

  if (agent.status === 'disabled') {
    return res.status(403).json({ error: '账号已被禁用，请联系管理员' })
  }

  const token = signToken({
    id: agent.id,
    email: agent.email,
    role: agent.role,
    status: agent.status,
    name: agent.name,
  })

  setCookieToken(res, token)

  return res.status(200).json({
    id: agent.id,
    email: agent.email,
    role: agent.role,
    status: agent.status,
    name: agent.name,
  })
}
