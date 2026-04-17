'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Languages, Check } from 'lucide-react'
import { useLanguage } from '@/lib/language-context'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Languages className="h-5 w-5" />
          <span className="sr-only">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setLanguage('en')}
          className="cursor-pointer gap-2"
        >
          {language === 'en' && <Check className="h-4 w-4" />}
          <span className={language !== 'en' ? 'ml-6' : ''}>English</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLanguage('kn')}
          className="cursor-pointer gap-2"
        >
          {language === 'kn' && <Check className="h-4 w-4" />}
          <span className={language !== 'kn' ? 'ml-6' : ''}>ಕನ್ನಡ</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
