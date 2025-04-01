import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flame, Snowflake } from 'lucide-react'
import { DateTime } from 'luxon'
import { ThemeToggle } from '../theme-toggle'
import { ProfileMenu } from '../profile/profile-menu'
import { LanguageSwitch } from '../language/language-switch'

function Header() {
  return (
    <header className="w-full mt-2">
      <div className="container flex items-center justify-between h-14 w-full px-2">
        <div className="flex items-center gap-2">
          <img src="/assets/favicon-96x96.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
          <h1 className="text-lg font-semibold hidden sm:inline">Random Wikipedia Explorer</h1>
          <h1 className="text-lg font-semibold sm:hidden">RWE</h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitch />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}

export function StreakDisplay() {
  const { user, updateStreak } = useAuth()
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    // Update streak when component mounts
    if (user) {
      handleStreakUpdate()
    }
  }, [])

  const handleStreakUpdate = async () => {
    if (!user) return

    try {
      const response = await updateStreak()
      if (response.updatedToday) {
        setMessage('Streak updated!')
      } else {
        setMessage('Not yep updated today...')
      }
    } catch (error) {
      console.error('Failed to update streak:', error)
      setMessage('Failed to update streak')
    }
  }

  if (!user) {
    return (
      <Card className="w-full">
        <Header />

        <CardContent className="flex flex-col items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Log in to track your daily reading streak and progress!
          </div>
          <Button asChild variant="default" className="w-full sm:w-auto">
            <a href="/login">Login</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <Header />
      <CardContent>
        <div className="flex items-center gap-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{user.streak}</div>
            {user.lastStreak && DateTime.fromJSDate(new Date(user.lastStreak)).hasSame(DateTime.now(), 'day') ? (
              <Flame className="h-5 w-5 text-orange-500" />
            ) : (
              <Snowflake className="h-5 w-5 text-blue-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {user.streak === 1 ? 'day' : 'days'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground border-l pl-4">
            Last: {user.lastStreak ? new Date(user.lastStreak).toLocaleDateString() : 'Never'}
          </div>
          {message && (
            <div className="text-sm text-muted-foreground border-l pl-4">
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
