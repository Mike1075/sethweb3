import { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: '', ...options, maxAge: 0 })
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { data: initialProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('usage_count, usage_limit')
    .eq('id', user.id)
    .single()

  // 若用户配置未创建（触发器未生效或旧账号），自动补建一条默认记录
  let profile = initialProfile
  if (profileError || !profile) {
    const { data: created, error: createError } = await supabase
      .from('user_profiles')
      .insert({ id: user.id, email: user.email, subscription_type: 'free', usage_count: 0, usage_limit: 15 })
      .select('usage_count, usage_limit')
      .single()
    if (createError || !created) {
      return new Response(JSON.stringify({ error: 'Failed to create profile' }), { status: 500 })
    }
    profile = created
  }

  if (profile.usage_count >= profile.usage_limit) {
    return new Response(JSON.stringify({ allowed: false }), { status: 403 })
  }

  const { data: updated, error: updateError } = await supabase
    .from('user_profiles')
    .update({ usage_count: profile.usage_count + 1 })
    .eq('id', user.id)
    .select('usage_count, usage_limit')
    .single()

  if (updateError || !updated) {
    return new Response(JSON.stringify({ error: 'Failed to update usage' }), { status: 500 })
  }

  return new Response(
    JSON.stringify({ allowed: true, usage_count: updated.usage_count, usage_limit: updated.usage_limit }),
    { status: 200 }
  )
}

