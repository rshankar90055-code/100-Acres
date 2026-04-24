import 'server-only'

const DEFAULT_SEND_URL = 'https://control.msg91.com/api/v5/otp'
const DEFAULT_VERIFY_URL = 'https://control.msg91.com/api/v5/otp/verify'
const DEFAULT_RETRY_URL = 'https://control.msg91.com/api/v5/otp/retry'

type Msg91Payload = Record<string, unknown> | string | null

interface Msg91RequestOptions {
  url: string
  method: 'GET' | 'POST'
  params: Record<string, string>
}

function getRequiredEnv(name: string) {
  const value = process.env[name]

  if (!value) {
    throw new Error(`${name} is not configured.`)
  }

  return value
}

function toMobileParam(phone: string) {
  return phone.replace(/\D/g, '')
}

function buildUrl(url: string, params: Record<string, string>) {
  const target = new URL(url)

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      target.searchParams.set(key, value)
    }
  })

  return target
}

async function parseMsg91Payload(response: Response): Promise<Msg91Payload> {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return text
  }
}

function readMessage(payload: Msg91Payload) {
  if (!payload) return 'Unknown MSG91 response.'

  if (typeof payload === 'string') {
    return payload
  }

  const message = payload.message
  if (typeof message === 'string' && message.trim()) {
    return message
  }

  const detail = payload.details
  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  const type = payload.type
  if (typeof type === 'string' && type.trim()) {
    return type
  }

  return 'MSG91 request failed.'
}

function isSuccessPayload(payload: Msg91Payload) {
  if (!payload) return false

  if (typeof payload === 'string') {
    const normalized = payload.toLowerCase()
    return normalized.includes('success') || normalized.includes('sent')
  }

  const type = typeof payload.type === 'string' ? payload.type.toLowerCase() : ''
  const message = typeof payload.message === 'string' ? payload.message.toLowerCase() : ''

  return (
    type === 'success' ||
    message.includes('success') ||
    message.includes('sent') ||
    message.includes('verified')
  )
}

async function runMsg91Request(options: Msg91RequestOptions) {
  const target = buildUrl(options.url, options.params)

  const response =
    options.method === 'GET'
      ? await fetch(target, {
          method: 'GET',
          cache: 'no-store',
        })
      : await fetch(target, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(options.params),
          cache: 'no-store',
        })

  const payload = await parseMsg91Payload(response)

  if (response.ok && isSuccessPayload(payload)) {
    return payload
  }

  const message = readMessage(payload)
  throw new Error(message)
}

async function runWithFallback(primary: Msg91RequestOptions, fallback: Msg91RequestOptions) {
  try {
    return await runMsg91Request(primary)
  } catch {
    return runMsg91Request(fallback)
  }
}

export async function sendMsg91Otp(phone: string) {
  const authKey = getRequiredEnv('MSG91_AUTH_KEY')
  const templateId = getRequiredEnv('MSG91_TEMPLATE_ID')
  const mobile = toMobileParam(phone)

  return runWithFallback(
    {
      url: process.env.MSG91_SEND_OTP_URL || DEFAULT_SEND_URL,
      method: 'POST',
      params: {
        authkey: authKey,
        mobile,
        template_id: templateId,
      },
    },
    {
      url: process.env.MSG91_SEND_OTP_URL || DEFAULT_SEND_URL,
      method: 'GET',
      params: {
        authkey: authKey,
        mobile,
        template_id: templateId,
      },
    },
  )
}

export async function verifyMsg91Otp(phone: string, otp: string) {
  const authKey = getRequiredEnv('MSG91_AUTH_KEY')
  const mobile = toMobileParam(phone)

  return runWithFallback(
    {
      url: process.env.MSG91_VERIFY_OTP_URL || DEFAULT_VERIFY_URL,
      method: 'GET',
      params: {
        authkey: authKey,
        mobile,
        otp,
      },
    },
    {
      url: process.env.MSG91_VERIFY_OTP_URL || DEFAULT_VERIFY_URL,
      method: 'POST',
      params: {
        authkey: authKey,
        mobile,
        otp,
      },
    },
  )
}

export async function resendMsg91Otp(phone: string) {
  const authKey = getRequiredEnv('MSG91_AUTH_KEY')
  const mobile = toMobileParam(phone)

  return runWithFallback(
    {
      url: process.env.MSG91_RETRY_OTP_URL || DEFAULT_RETRY_URL,
      method: 'GET',
      params: {
        authkey: authKey,
        mobile,
        retrytype: 'text',
      },
    },
    {
      url: process.env.MSG91_RETRY_OTP_URL || DEFAULT_RETRY_URL,
      method: 'POST',
      params: {
        authkey: authKey,
        mobile,
        retrytype: 'text',
      },
    },
  )
}
