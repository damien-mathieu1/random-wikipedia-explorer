import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class UsersController {
  /**
   * Handle user registration
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['email', 'password', 'fullName', 'lang'])
    const user = await User.create(data)
    return response.created(user)
  }

  /**
   * Update user language preference
   */
  async updateLanguage({ auth, request, response }: HttpContext) {
    const user = auth.user!
    const { lang } = request.only(['lang'])
    
    if (lang !== 'en' && lang !== 'fr') {
      return response.badRequest({ error: 'Invalid language code' })
    }

    user.lang = lang
    await user.save()

    return response.ok({ lang: user.lang })
  }

  /**
   * Update user streak
   */
  async updateStreak({ auth, response }: HttpContext) {
    const user = auth.user!
    const now = DateTime.now()
    
    // If there's no last streak or it was from a previous day
    if (!user.lastStreak || !now.hasSame(user.lastStreak, 'day')) {
      // If last streak was from yesterday, increment streak
      if (user.lastStreak && now.minus({ days: 1 }).hasSame(user.lastStreak, 'day')) {
        user.streak += 1
      } else {
        // Otherwise reset streak
        user.streak = 1
      }
      user.lastStreak = now
      await user.save()
    }
    
    return response.ok({ 
      streak: user.streak,
      lastStreak: user.lastStreak,
      updatedToday: true
    })
  }

  /**
   * Get user profile with streak
   */
  async show({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok({
      email: user.email,
      streak: user.streak,
      lastStreak: user.lastStreak,
      fullname: user.fullName,
      lang: user.lang
    })
  }
}
