import type { NextApiRequest, NextApiResponse } from 'next'
import { getServiceSupabase } from '@/lib/supabase'
import { hashPassword, signToken, setCookieToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { email, password, name, telegram, inviteCode, agentType } = req.body

  if (!email || !password || !inviteCode) {
    return res.status(400).json({ error: '请填写所有必填项' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: '密码至少8位' })
  }

  const supabase = getServiceSupabase()

  // Check invite code
  const { data: invite } = await supabase
    .from('invite_codes')
    .select('*')
    .eq('code', inviteCode.trim())
    .is('used_by', null)
    .single()

  if (!invite) {
    return res.status(400).json({ error: '邀请码无效或已被使用' })
  }

  // Check email uniqueness
  const { data: existing } = await supabase
    .from('agents')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (existing) {
    return res.status(400).json({ error: '该邮箱已注册' })
  }

  const passwordHash = await hashPassword(password)

  // Create agent
  const { data: agent, error } = await supabase
    .from('agents')
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      name: name?.trim() || null,
      telegram: telegram?.trim() || null,
      invite_code_used: inviteCode.trim(),
      role: 'agent',
      status: 'pending',
      agent_type: agentType === 'reseller' ? 'reseller' : 'affiliate',
      discount_rate: agentType === 'reseller' ? 0.85 : 1.0,
    })
    .select()
    .single()

  if (error || !agent) {
    console.error('Register error:', error)
    return res.status(500).json({ error: '注册失败，请重试' })
  }

  // Mark invite code as used
  await supabase
    .from('invite_codes')
    .update({ used_by: agent.id, used_at: new Date().toISOString() })
    .eq('id', invite.id)

  const token = signToken({
    id: agent.id,
    email: agent.email,
    role: agent.role,
    status: agent.status,
    name: agent.name,
  })

  setCookieToken(res, token)

  return res.status(201).json({ success: true, status: agent.status })
}
