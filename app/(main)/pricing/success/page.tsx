'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { getCheckoutSession } from '@/app/actions/stripe'
import { useLanguage } from '@/lib/language-context'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [email, setEmail] = useState<string | null>(null)
  const { t } = useLanguage()

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    const checkSession = async () => {
      const result = await getCheckoutSession(sessionId)
      if (result.error || result.status !== 'complete') {
        setStatus('error')
      } else {
        setStatus('success')
        setEmail(result.customerEmail || null)
      }
    }

    checkSession()
  }, [sessionId])

  if (status === 'loading') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">{t('pricing.verifying')}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <CardTitle>{t('pricing.errorTitle')}</CardTitle>
            <CardDescription>{t('pricing.errorDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href="/pricing">{t('pricing.tryAgain')}</Link>
            </Button>
            <Button asChild>
              <Link href="/">{t('common.home')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t('pricing.successTitle')}</CardTitle>
          <CardDescription>
            {t('pricing.successDescription')}
            {email && (
              <span className="mt-2 block font-medium text-foreground">{email}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button asChild className="w-full">
            <Link href="/agent/dashboard">{t('pricing.goToDashboard')}</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/agent/listings">{t('pricing.manageListings')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}