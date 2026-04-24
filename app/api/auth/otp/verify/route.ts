import { NextRequest, NextResponse } from 'next/server'
import { completePhoneOtpAuth } from '@/lib/auth/phone-auth-server'
import { verifyMsg91Otp } from '@/lib/auth/msg91'
import { normalizePhoneNumber } from '@/lib/phone'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const mode = body.mode === 'sign-up' ? 'sign-up' : 'login'
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const phone = normalizePhoneNumber(body.phone)
    const otp = typeof body.otp === 'string' ? body.otp.trim() : ''

    if (!otp) {
      return NextResponse.json({ error: 'Enter the OTP first.' }, { status: 400 })
    }

    await verifyMsg91Otp(phone, otp)

    const result = await completePhoneOtpAuth({
      fullName,
      mode,
      phone,
    })

    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not verify OTP.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
