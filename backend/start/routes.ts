/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Group all routes under /api prefix
router.group(() => {
  // Auth routes
  router.post('auth/register', '#controllers/users_controller.store')
  router.post('auth/login', '#controllers/session_controller.store')

  // Protected routes (require authentication)
  router.group(() => {
    router.post('streak', '#controllers/users_controller.updateStreak')
    router.get('me', '#controllers/users_controller.show')
    router.post('language', '#controllers/users_controller.updateLanguage')
    router.post('auth/logout', async ({ auth, response }) => {
      await auth.use('web').logout()
      return response.ok({ message: 'Logged out successfully' })
    })
  }).use([middleware.auth()])
}).prefix('api')