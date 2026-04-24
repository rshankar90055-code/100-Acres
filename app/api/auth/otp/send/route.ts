import { NextRequest, NextResponse } from 'next/server'
import { preparePhoneOtpRequest } from '@/lib/auth/phone-auth-server'
import { sendMsg91Otp } from '@/lib/auth/msg91'
import { normalizePhoneNumber } from '@/lib/phone'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mode = body.mode === 'sign-up' ? 'sign-up' : 'login'
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const phone = normalizePhoneNumber(body.phone)

    if (mode === 'sign-up' && !fullName) {
      return NextResponse.json(
        { error: 'Enter your full name before requesting OTP.' },
        { status: 400 },
      )
    }

    await preparePhoneOtpRequest(mode, phone)
    await sendMsg91Otp(phone)

    return NextResponse.json({ phone })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not send OTP.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
