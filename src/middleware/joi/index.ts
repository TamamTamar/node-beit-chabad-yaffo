import loginSchema from "../../validations/login-schema";
import userSchema, { updateUserSchema } from "../../validations/user-schema";
import { validateSchema } from "./validate-schema";



export const validateUser = validateSchema(userSchema);
export const validateLogin = validateSchema(loginSchema);

export const validateUpdateUser = validateSchema(updateUserSchema);

