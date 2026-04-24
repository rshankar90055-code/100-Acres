import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-[linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(240,253,244,1)_100%)] p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Phone verification is live</CardTitle>
          <CardDescription>
            Account creation now happens through mobile OTP. Use your verified number to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This app now uses a custom MSG91-powered SMS OTP flow. Add your `MSG91_AUTH_KEY`, `MSG91_TEMPLATE_ID`, `SUPABASE_SERVICE_ROLE_KEY`, and `PHONE_AUTH_SECRET` before testing phone login.
          </p>
          <Button asChild className="w-full">
            <Link href="/auth/sign-up">Go to phone sign up</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
