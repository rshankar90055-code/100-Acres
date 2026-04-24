import { NextRequest, NextResponse } from 'next/server'
import { resendMsg91Otp } from '@/lib/auth/msg91'
import { normalizePhoneNumber } from '@/lib/phone'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const phone = normalizePhoneNumber(body.phone)

    await resendMsg91Otp(phone)

    return NextResponse.json({ phone })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not resend OTP.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
