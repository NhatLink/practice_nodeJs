import { JwtPayload } from 'jsonwebtoken'
import { TokenType } from '../../constants/enums'

export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface TokenPayload extends JwtPayload {
  user_id: string
  token_type: TokenType
}

export interface forgotPasswordReqBody {
  email: string
}

export interface verifyForgotPasswordTokenReqBody {
  forgot_password_token: string
}
