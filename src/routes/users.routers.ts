import { Router } from 'express'
import {
  accessTokenValidate,
  emailVerifyTokenValidate,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidate,
  registerValidation,
  verifyForgotPasswordTokenValidator
} from '../middlewares/users.midlewares'
import {
  emailVerifyController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resendEmailVerifyController,
  verifyForgotPasswordTokenController
} from '../controllers/users.controllers'
import validate from '../units/validation'
import { wrapAsync } from '../units/handller'

const usersRouter = Router()

usersRouter.post('/login', validate(loginValidator), wrapAsync(loginController))
usersRouter.post('/logout', validate(accessTokenValidate), validate(refreshTokenValidate), wrapAsync(logoutController))
usersRouter.post('/verify-email', validate(emailVerifyTokenValidate), wrapAsync(emailVerifyController))
usersRouter.post('/resend-verify-email', validate(accessTokenValidate), wrapAsync(resendEmailVerifyController))
usersRouter.post('/register', validate(registerValidation), wrapAsync(registerController))
usersRouter.post('/forgot-password', validate(forgotPasswordValidator), wrapAsync(forgotPasswordController))
usersRouter.post(
  '/verify-forgot-password-token',
  validate(verifyForgotPasswordTokenValidator),
  wrapAsync(verifyForgotPasswordTokenController)
)

export default usersRouter
