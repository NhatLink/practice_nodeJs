import { Request, Response } from 'express'
import userService from '../services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  forgotPasswordReqBody,
  LoginReqBody,
  LogoutReqBody,
  RegisterReqBody,
  TokenPayload,
  VerifyEmailReqBody,
  verifyForgotPasswordTokenReqBody
} from '../models/requests/users.requests'
import User from '../models/schemas/users.schema'
import { ObjectId } from 'mongodb'
import databaseService from '../services/database.services'
import httpStatus, { userMessages } from '../constants/httpStatus'
import { validationMessages } from '../constants/validationMessages '
import { UserVerifyStatus } from '../constants/enums'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await userService.login(user_id.toString())
  res.status(200).json({
    message: 'Login successfully',
    result
  })
  return
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    message: 'Registered successfully',
    result
  })
  return
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.status(200).json({
    result
  })
  return
}

export const emailVerifyController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_email_verify_token as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      message: validationMessages.user.notFound
    })
    return
  }
  if (user.email_verify_token === '') {
    res.status(httpStatus.OK).json({
      message: validationMessages.verifyEmailToken.verified
    })
    return
  }
  const result = await userService.verifyEmail(user_id)
  res.status(200).json({
    result
  })
  return
}

//Không sài body nên không set kiểu cho body
export const resendEmailVerifyController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
  if (!user) {
    res.status(httpStatus.NOT_FOUND).json({
      message: validationMessages.user.notFound
    })
    return
  }
  if (user?.verify === UserVerifyStatus.Verified) {
    res.json({
      message: validationMessages.verifyEmailToken.verified
    })
    return
  }
  const result = await userService.resendVerifyEmail(user_id)
  res.json({
    result
  })
}

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, forgotPasswordReqBody>,
  res: Response
) => {
  const { _id } = req.user as User
  const result = await userService.forgotPassword((_id as ObjectId).toString())
  res.json({
    result
  })
}

export const verifyForgotPasswordTokenController = async (
  req: Request<ParamsDictionary, any, verifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  res.json({
    message: validationMessages.forgotPassword.success
  })
}
