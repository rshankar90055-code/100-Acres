'use client'

import { useState } from 'react'
import { useLanguage } from '@/lib/language-context'
import { FEATURED_PACKAGES, formatPrice } from '@/lib/products'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rocket, Zap, Crown, Check } from 'lucide-react'
import { FeaturedListingCheckout } from './checkout'

interface BoostListingDialogProps {
  propertyId: string
  propertyTitle: string
  trigger?: React.ReactNode
}

const packageIcons = {
  'boost-7': Zap,
  'boost-15': Rocket,
  'boost-30': Crown,
}

export function BoostListingDialog({ 
  propertyId, 
  propertyTitle,
  trigger 
}: BoostListingDialogProps) {
  const { language, t } = useLanguage()
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Rocket className="h-4 w-4" />
            {t('boost.button')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('boost.title')}</DialogTitle>
          <DialogDescription>
            {t('boost.subtitle')} &quot;{propertyTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        {selectedPackage ? (
          <div className="mt-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mb-4"
              onClick={() => setSelectedPackage(null)}
            >
              &larr; {t('common.back')}
            </Button>
            <FeaturedListingCheckout
              packageId={selectedPackage}
              propertyId={propertyId}
              buttonText={t('boost.proceedPayment')}
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {FEATURED_PACKAGES.map((pkg) => {
              const Icon = packageIcons[pkg.id as keyof typeof packageIcons] || Zap
              return (
                <Card 
                  key={pkg.id} 
                  className="cursor-pointer transition-all hover:border-primary hover:shadow-md"
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  <CardHeader className="pb-2 text-center">
                    <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">
                      {language === 'kn' ? pkg.nameKn : pkg.name}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {language === 'kn' ? pkg.descriptionKn : pkg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="mb-3">
                      <span className="text-2xl font-bold">{formatPrice(pkg.priceInCents)}</span>
                    </div>
                    <ul className="mb-4 space-y-1.5 text-left text-xs">
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary" />
                        {pkg.durationDays} {t('boost.days')}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary" />
                        {pkg.boostMultiplier}x {t('boost.visibility')}
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-primary" />
                        {t('boost.topSearch')}
                      </li>
                    </ul>
                    <Badge variant="secondary" className="w-full justify-center">
                      {t('boost.select')}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
