import { NextFunction, Request, Response } from 'express'
import { body, checkSchema } from 'express-validator'
import userService from '../services/users.services'
import { ErrorWithStatus } from '../models/Errors'
import { validationMessages } from '../constants/validationMessages '
import databaseService from '../services/database.services'
import { hashPassword } from '../units/crypto'
import { verifyToken } from '../units/jwt'
import httpStatus from '../constants/httpStatus'
import { JsonWebTokenError } from 'jsonwebtoken'
import { capitalize } from 'lodash'

export const loginValidator = checkSchema(
  {
    email: {
      notEmpty: {
        errorMessage: validationMessages.email.required
      },
      isEmail: {
        errorMessage: validationMessages.email.invalid
      },
      normalizeEmail: true,
      custom: {
        options: async (value, { req }) => {
          const user = await databaseService.users.findOne({ email: value, password: hashPassword(req.body.password) })
          if (!user) {
            throw new Error(validationMessages.email.emalilNotFound)
          }
          req.user = user
          return true
        }
      }
    },

    password: {
      notEmpty: {
        errorMessage: validationMessages.password.required
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.password.length
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: validationMessages.password.strong
      }
    }
  },
  ['body']
)

export const registerValidation = checkSchema(
  {
    name: {
      notEmpty: {
        errorMessage: validationMessages.name.required
      },
      isLength: {
        options: { min: 2, max: 100 },
        errorMessage: validationMessages.name.length
      },
      trim: true,
      escape: true
    },

    email: {
      notEmpty: {
        errorMessage: validationMessages.email.required
      },
      isEmail: {
        errorMessage: validationMessages.email.invalid
      },
      normalizeEmail: true,
      custom: {
        options: async (value) => {
          const emailExists = await userService.checkEmailExists(value)
          if (emailExists) {
            throw new Error(validationMessages.email.exists)
          }
          return true
        }
      }
    },

    password: {
      notEmpty: {
        errorMessage: validationMessages.password.required
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.password.length
      },
      isStrongPassword: {
        options: {
          minLength: 6,
          minUppercase: 1,
          minLowercase: 1,
          minNumbers: 1,
          minSymbols: 1
        },
        errorMessage: validationMessages.password.strong
      }
    },

    confirm_password: {
      notEmpty: {
        errorMessage: validationMessages.confirmPassword.required
      },
      custom: {
        options: (value, { req }) => value === req.body.password,
        errorMessage: validationMessages.confirmPassword.mismatch
      },
      isLength: {
        options: { min: 6, max: 50 },
        errorMessage: validationMessages.confirmPassword.length
      }
    },

    date_of_birth: {
      notEmpty: {
        errorMessage: validationMessages.dateOfBirth.required
      },
      isISO8601: {
        options: { strict: true, strictSeparator: true },
        errorMessage: validationMessages.dateOfBirth.format
      },
      toDate: true
    }
  },
  ['body']
)

export const accessTokenValidate = checkSchema(
  {
    Authorization: {
      in: ['headers'],
      notEmpty: {
        errorMessage: validationMessages.accessToken.required
      },
      custom: {
        options: async (value: string, { req }) => {
          // if (!value.startsWith('Bearer ')) {
          //   throw new ErrorWithStatus({
          //     message: validationMessages.accessToken.Bearer,
          //     status: httpStatus.UNAUTHORIZED
          //   })
          // }
          const accessToken = value.split(' ')[1]
          if (!accessToken) {
            throw new ErrorWithStatus({
              message: validationMessages.accessToken.required,
              status: httpStatus.UNAUTHORIZED
            })
          }
          try {
            const decoded_authorization = await verifyToken({ token: accessToken })
            ;(req as Request).decoded_authorization = decoded_authorization
          } catch (error) {
            if (error instanceof JsonWebTokenError) {
              console.log('error at acess')

              throw new ErrorWithStatus({
                message: capitalize(error.message),
                status: httpStatus.UNAUTHORIZED
              })
            } else {
              throw error
            }
          }

          return true
        }
      }
    }
  },
  ['headers']
)

export const refreshTokenValidate = checkSchema({
  refresh_token: {
    notEmpty: {
      errorMessage: validationMessages.refreshToken.required
    },
    custom: {
      options: async (value: string, { req }) => {
        try {
          // const decoded_refresh_token = await verifyToken({ token: value })
          // const refresh_token_data = databaseService.refreshToken.findOne({ token: value })
          //cho vao promise.all
          const [decoded_refresh_token, refresh_token_data] = await Promise.all([
            verifyToken({ token: value }),
            databaseService.refreshTokens.findOne({ token: value })
          ])
          if (refresh_token_data === null) {
            throw new ErrorWithStatus({
              message: validationMessages.refreshToken.notExits,
              status: httpStatus.UNAUTHORIZED
            })
          }
          ;(req as Request).decoded_refresh_token = decoded_refresh_token
        } catch (error) {
          if (error instanceof JsonWebTokenError) {
            throw new ErrorWithStatus({
              message: capitalize(error.message),
              status: httpStatus.UNAUTHORIZED
            })
          } else {
            throw error
          }
        }

        return true
      }

      // options: async (value: string, { req }) => {
      //   const [decoded, tokenDoc] = await Promise.all([
      //     verifyToken({ token: value }),
      //     databaseService.refreshTokens.findOne({ token: value })
      //   ])

      //   if (!tokenDoc) {
      //     throw new ErrorWithStatus({
      //       message: validationMessages.refreshToken.notExits,
      //       status: httpStatus.UNAUTHORIZED
      //     })
      //   }

      //   req.decoded_refresh_token = decoded
      //   return true
      // }
    }
  }
})
