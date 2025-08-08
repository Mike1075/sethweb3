import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(_req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !anon || !service) {
    return new Response(
      JSON.stringify({ error: 'Missing required env (SUPABASE url/keys)' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const admin = createClient(url, service)
  const pub = createClient(url, anon)

  async function tableExists(name: string) {
    const { error } = await admin
      .from(name)
      .select('*', { count: 'exact', head: true })
    return { exists: !error, error: error?.message }
  }

  async function rlsBlocksAnonSelect(name: string) {
    const { error } = await pub
      .from(name)
      .select('*', { head: true })
      .limit(1)
    // 若 RLS 启用且无匿名策略，通常返回 401/permission denied
    return { blocked: !!error, error: error?.message }
  }

  const checks: Record<string, { exists: boolean; exists_error?: string; rls_blocks_anon: boolean; rls_error?: string }> = {}
  for (const t of ['user_profiles', 'chat_conversations', 'chat_messages', 'subscriptions']) {
    // 表是否存在（可由 service_role 访问）
    const ex = await tableExists(t)
    // 匿名访问是否被 RLS 阻挡
    const rls = await rlsBlocksAnonSelect(t)
    checks[t] = { exists: ex.exists, exists_error: ex.error, rls_blocks_anon: rls.blocked, rls_error: rls.error }
  }

  return new Response(
    JSON.stringify({ ok: true, checks }, null, 2),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

