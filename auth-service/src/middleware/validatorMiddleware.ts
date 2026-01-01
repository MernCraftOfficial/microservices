import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import response from '../helper/responseHelper';
const signupSchema = joi.object({
  username: joi.string().min(5).max(15).alphanum().required(),
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .lowercase()
    .min(11)
    .required(),
  password: joi
    .string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
    )
    .required()
    .messages({
      'string.pattern.base':
        'The password must contain lowercase letter, uppercase letter, digit, special character and be between 8 and 30 characters long.',
    }),
});

const signinSchema = joi.object({
  email: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .lowercase()
    .min(11)
    .required(),
  password: joi.string().required(),
});

const resetPasswordSchema = joi.object({
  password: joi
    .string()
    .min(8)
    .max(30)
    .pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}$/,
    )
    .required()
    .messages({
      'string.pattern.base':
        'The password must contain lowercase letter, uppercase letter, digit, special character and be between 8 and 30 characters long.',
    }),
});

const forgotPasswordSchema = joi.object({
  receiverEmail: joi
    .string()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } })
    .lowercase()
    .min(11)
    .required(),
});

//to check if the schema is created for the given validator
const globalValidationObject = {
  signin: signinSchema,
  signup: signupSchema,
  reset: resetPasswordSchema,
  forgot: forgotPasswordSchema,
};

//obj type
type GlobalValidationObjectIndex = 'signin' | 'signup' | 'reset' | 'forgot';

// main function for validation
function Validator(obj: GlobalValidationObjectIndex) {
  if (!globalValidationObject.hasOwnProperty(obj)) {
    throw new Error(`validator does not exist!`);
  }
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      if (!req?.body) {
        response.sendErrorResponse(res, 'BAD_REQUEST', 'Body cannot be empty!');
        return;
      }

      await globalValidationObject[obj].validateAsync(req.body);
      next();
    } catch (error: any) {
      response.sendServerError(res, 'BAD_REQUEST', error.message);
      return;
    }
  };
}

export default Validator;
