import 'server-only'

import { createHmac } from 'node:crypto'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

type AuthMode = 'login' | 'sign-up'

interface CompletePhoneOtpAuthParams {
  fullName?: string
  mode: AuthMode
  phone: string
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}

function createAdminClient() {
  return createSupabaseClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

function createAuthClient() {
  return createSupabaseClient(
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_URL'),
    getRequiredEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}

function buildPhonePassword(phone: string) {
  const secret = getRequiredEnv('PHONE_AUTH_SECRET')

  return `Pa!${createHmac('sha256', secret).update(phone).digest('hex')}`
}

async function getLinkedUserId(phone: string) {
  const admin = createAdminClient()

  const [{ data: identity }, { data: profile }] = await Promise.all([
    admin
      .from('phone_identities')
      .select('user_id')
      .eq('phone', phone)
      .maybeSingle(),
    admin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle(),
  ])

  return identity?.user_id || profile?.id || null
}

async function syncPhoneIdentity(phone: string, userId: string) {
  const admin = createAdminClient()

  const { error } = await admin.from('phone_identities').upsert(
    {
      phone,
      user_id: userId,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'phone',
    },
  )

  if (error) {
    throw error
  }
}

async function syncProfile(userId: string, phone: string, fullName?: string) {
  const admin = createAdminClient()

  const payload: Record<string, unknown> = {
    id: userId,
    phone,
    updated_at: new Date().toISOString(),
  }

  if (fullName?.trim()) {
    payload.full_name = fullName.trim()
  }

  const { error } = await admin.from('profiles').upsert(payload, {
    onConflict: 'id',
  })

  if (error) {
    throw error
  }
}

async function ensureAuthUser({ fullName, mode, phone }: CompletePhoneOtpAuthParams) {
  const admin = createAdminClient()
  const password = buildPhonePassword(phone)
  const linkedUserId = await getLinkedUserId(phone)

  if (linkedUserId) {
    if (mode === 'sign-up') {
      throw new Error('This mobile number already has an account. Please log in instead.')
    }

    const { error: authError } = await admin.auth.admin.updateUserById(linkedUserId, {
      password,
      phone,
      phone_confirm: true,
      user_metadata: {
        phone,
        ...(fullName?.trim() ? { full_name: fullName.trim() } : {}),
      },
    })

    if (authError) {
      throw authError
    }

    await Promise.all([
      syncPhoneIdentity(phone, linkedUserId),
      syncProfile(linkedUserId, phone, fullName),
    ])

    return { created: false, userId: linkedUserId, password }
  }

  if (mode === 'login') {
    throw new Error('No account found for this mobile number. Please sign up first.')
  }

  const { data, error } = await admin.auth.admin.createUser({
    phone,
    phone_confirm: true,
    password,
    user_metadata: {
      full_name: fullName?.trim() || null,
      phone,
      role: 'user',
    },
  })

  if (error) {
    throw error
  }

  const userId = data.user?.id

  if (!userId) {
    throw new Error('Could not create the account for this mobile number.')
  }

  await Promise.all([
    syncPhoneIdentity(phone, userId),
    syncProfile(userId, phone, fullName),
  ])

  return { created: true, userId, password }
}

async function resolveRedirectPath(userId: string) {
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (profile?.role === 'admin') return '/admin'
  if (profile?.role === 'agent') return '/agent/dashboard'
  return '/dashboard'
}

export async function preparePhoneOtpRequest(mode: AuthMode, phone: string) {
  const linkedUserId = await getLinkedUserId(phone)

  if (mode === 'login' && !linkedUserId) {
    throw new Error('No account found for this mobile number. Please sign up first.')
  }

  if (mode === 'sign-up' && linkedUserId) {
    throw new Error('This mobile number already has an account. Please log in instead.')
  }
}

export async function completePhoneOtpAuth(params: CompletePhoneOtpAuthParams) {
  const { password, userId } = await ensureAuthUser(params)
  const authClient = createAuthClient()

  const { data, error } = await authClient.auth.signInWithPassword({
    phone: params.phone,
    password,
  })

  if (error) {
    throw error
  }

  if (!data.session) {
    throw new Error('Could not create a session for this mobile number.')
  }

  const redirectPath = await resolveRedirectPath(userId)

  return {
    redirectPath,
    session: {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    },
  }
}
