'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, MessageSquareText, ShieldCheck, Smartphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPhoneForDisplay, normalizePhoneNumber } from '@/lib/phone'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type AuthMode = 'login' | 'sign-up'

interface PhoneAuthFormProps {
  mode: AuthMode
}

export function PhoneAuthForm({ mode }: PhoneAuthFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const isSignup = mode === 'sign-up'
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [normalizedPhone, setNormalizedPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [isSendingOtp, setIsSendingOtp] = useState(false)
  const [isResendingOtp, setIsResendingOtp] = useState(false)
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false)

  const heading = useMemo(
    () =>
      isSignup
        ? {
            title: 'Create Account',
            description: 'Use your mobile number and SMS OTP to create a verified account.',
            actionLabel: 'Create account',
            alternateLabel: 'Already have an account?',
            alternateHref: '/auth/login',
            alternateAction: 'Login',
          }
        : {
            title: 'Phone Login',
            description: 'Sign in with your verified mobile number using a one-time SMS code.',
            actionLabel: 'Send OTP',
            alternateLabel: 'Need a new account?',
            alternateHref: '/auth/sign-up',
            alternateAction: 'Create one',
          },
    [isSignup],
  )

  const sendOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setIsSendingOtp(true)

    try {
      const mobile = normalizePhoneNumber(phone)

      if (isSignup && !fullName.trim()) {
        throw new Error('Enter your full name before requesting OTP.')
      }

      const response = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          mode,
          phone: mobile,
        }),
      })

      const payload = (await response.json()) as { error?: string; phone?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Could not send OTP.')
      }

      setNormalizedPhone(mobile)
      setOtpSent(true)
      setInfo(`OTP sent to ${formatPhoneForDisplay(mobile)}.`)
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : 'Could not send OTP.')
    } finally {
      setIsSendingOtp(false)
    }
  }

  const resendOtp = async () => {
    setError(null)
    setInfo(null)
    setIsResendingOtp(true)

    try {
      const response = await fetch('/api/auth/otp/resend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: normalizedPhone,
        }),
      })

      const payload = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(payload.error || 'Could not resend OTP.')
      }

      setInfo(`A fresh OTP was sent to ${formatPhoneForDisplay(normalizedPhone)}.`)
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : 'Could not resend OTP.')
    } finally {
      setIsResendingOtp(false)
    }
  }

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault()
    setError(null)
    setInfo(null)
    setIsVerifyingOtp(true)

    try {
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          mode,
          otp,
          phone: normalizedPhone,
        }),
      })

      const payload = (await response.json()) as {
        error?: string
        redirectPath?: string
        session?: {
          access_token: string
          refresh_token: string
        }
      }

      if (!response.ok || !payload.session || !payload.redirectPath) {
        throw new Error(payload.error || 'Could not verify OTP.')
      }

      const { error: sessionError } = await supabase.auth.setSession(payload.session)

      if (sessionError) {
        throw sessionError
      }

      const redirectPath = payload.redirectPath
      router.push(redirectPath)
      router.refresh()
    } catch (authError: unknown) {
      setError(authError instanceof Error ? authError.message : 'Could not verify OTP.')
    } finally {
      setIsVerifyingOtp(false)
    }
  }

  const resetFlow = () => {
    setOtpSent(false)
    setOtp('')
    setNormalizedPhone('')
    setError(null)
    setInfo(null)
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.18),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(240,253,244,1)_100%)] p-6 md:p-10">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />
      <div className="relative grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-0 bg-slate-950 text-white shadow-2xl">
          <CardHeader className="space-y-6 p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
              <Smartphone className="h-6 w-6" />
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl tracking-tight">Phone-first access</CardTitle>
              <CardDescription className="max-w-md text-base text-slate-300">
                Verified mobile login is the cleanest way to reduce trial abuse and keep creator access tied to real numbers.
              </CardDescription>
            </div>
            <div className="grid gap-3 text-sm text-slate-200">
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium">OTP-based verification</p>
                  <p className="text-slate-300">Each login requires an SMS code, which gives you stronger identity checks for trials and creator tools.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                <MessageSquareText className="mt-0.5 h-5 w-5 text-emerald-300" />
                <div>
                  <p className="font-medium">India-first number handling</p>
                  <p className="text-slate-300">Users can enter `9876543210` and we normalize it to `+91` format before requesting OTP.</p>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="border-slate-200 bg-white/90 shadow-xl backdrop-blur">
          <CardHeader>
            <CardTitle className="text-2xl">{heading.title}</CardTitle>
            <CardDescription>{heading.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {!otpSent ? (
              <form onSubmit={sendOtp} className="space-y-5">
                {isSignup ? (
                  <div className="grid gap-2">
                    <Label htmlFor="full-name">Full Name</Label>
                    <Input
                      id="full-name"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                      placeholder="Your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                ) : null}

                <div className="grid gap-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use international format, or enter a 10-digit Indian mobile number.
                  </p>
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {info ? <p className="text-sm text-emerald-700">{info}</p> : null}

                <Button type="submit" className="w-full" disabled={isSendingOtp}>
                  {isSendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    heading.actionLabel
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOtp} className="space-y-5">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="font-medium text-emerald-900">OTP sent</p>
                  <p className="mt-1 text-sm text-emerald-800">
                    Enter the code sent to {formatPhoneForDisplay(normalizedPhone)}.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="otp">OTP Code</Label>
                  <Input
                    id="otp"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required
                  />
                </div>

                {error ? <p className="text-sm text-red-600">{error}</p> : null}
                {info ? <p className="text-sm text-emerald-700">{info}</p> : null}

                <div className="flex gap-3">
                  <Button type="submit" className="flex-1" disabled={isVerifyingOtp}>
                    {isVerifyingOtp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetFlow} disabled={isVerifyingOtp}>
                    Change number
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={resendOtp}
                  disabled={isVerifyingOtp || isResendingOtp}
                >
                  {isResendingOtp ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resending OTP...
                    </>
                  ) : (
                    'Resend OTP'
                  )}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {heading.alternateLabel}{' '}
              <Link href={heading.alternateHref} className="font-medium text-foreground underline underline-offset-4">
                {heading.alternateAction}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
