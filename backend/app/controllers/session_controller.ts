import User from '#models/user'
import { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async store({ request, auth, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])
      const user = await User.verifyCredentials(email, password)
      await auth.use('web').login(user)
      return response.ok({ message: 'Login successful' })
    } catch (error) {
      return response.badRequest({ error: 'Invalid credentials' })
    }
  }
}
