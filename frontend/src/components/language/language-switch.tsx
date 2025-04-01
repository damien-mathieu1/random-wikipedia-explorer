import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Languages } from 'lucide-react'
import Cookies from 'js-cookie'

export function LanguageSwitch() {
  const { user, updateLanguage } = useAuth()

  const handleLanguageChange = async (lang: 'en' | 'fr') => {
    if (user) {
      await updateLanguage(lang)
    } else {
      // Store language preference in cookie for non-logged-in users
      Cookies.set('preferred_lang', lang, { expires: 365 })
      // Force reload to update content
      window.location.reload()
    }
  }

  // Get current language from user or cookie
  const currentLang = user?.lang || Cookies.get('preferred_lang') || 'en'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Languages className="h-5 w-5" />
          <span className="sr-only">Switch language</span>
          <span className="absolute -bottom-1 -right-1 text-xs font-medium">
            {currentLang.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange('en')}
          className={currentLang === 'en' ? 'bg-accent' : ''}
        >
          English
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange('fr')}
          className={currentLang === 'fr' ? 'bg-accent' : ''}
        >
          Français
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
