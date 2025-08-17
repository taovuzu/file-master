import { body, query } from "express-validator";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

const emailValidator = () => {
  return [
    // body("email")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("Email is required")
    //   .isEmail()
    //   .withMessage("Please enter valid email")
    //   .normalizeEmail()
  ];
};

const usernameValidator = () => {
  return [
    // body("username")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("username is required")
    //   .matches(/^[a-zA-Z0-9_]{3,30}$/)
    //   .withMessage("userName must be 3-30 characters long and contain only letters, numbers, or underscores.")
  ];
};

const passwordValidator = () => {
  return [
    // body("password")
    //   .trim()
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Length between 8 and 16 characters \nAt least one lowercase letter(a - z) \nAt least one uppercase letter(A - Z) \nAt least one digit(0 - 9)\nAt least one special character(e.g., !@#$%`)")
  ];
};

const userLoginValidator = () => {
  return [
    // body("email")
    //   .optional()
    //   .isEmail()
    //   .withMessage("Email is invalid"),
    // body("username")
    //   .optional()
    //   .matches(/^[a-zA-Z0-9_]{3,30}$/)
    //   .withMessage("userName must be 3-20 characters long and contain only letters, numbers, or underscores."),
    // body("password")
    //   .notEmpty()
    //   .withMessage("Password is required")
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Length between 8 and 16 characters \nAt least one lowercase letter(a - z) \nAt least one uppercase letter(A - Z) \nAt least one digit(0 - 9)\nAt least one special character(e.g., !@#$%`)"),
    // body().custom(({ req }) => {
    //   if (!req.body.email && !req.body.username) {
    //     throw new ApiError("Either username or email is required");
    //   }
    // }),
  ];
};

const userRegisterValidator = () => {
  return [
    // body("email")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("Email is required")
    //   .isEmail()
    //   .withMessage("Please enter valid email")
    //   .normalizeEmail(),
    // body("username")
    //   .trim()
    //   .notEmpty()
    //   .withMessage("username is required")
    //   .matches(/^[a-zA-Z0-9_]{3,30}$/)
    //   .withMessage("userName must be 3-20 characters long and contain only letters, numbers, or underscores."),
    // body("password")
    //   .trim()
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Length between 8 and 16 characters and At least one lowercase letter(a - z) and At least one uppercase letter(A - Z) and At least one digit(0 - 9) and At least one special character(e.g., !@#$%`)")
  ];
};

const changeCurrentPasswordValidator = () => {
  return [
    // body("newPassword")
    //   .trim()
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Length between 8 and 16 characters and At least one lowercase letter(a - z) and At least one uppercase letter(A - Z) and At least one digit(0 - 9) and At least one special character(e.g., !@#$%`)"),
    // body("oldPassword")
    //   .trim()
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Invalid old password")
  ];
};

const resetForgottenPasswordValidator = () => {
  return [
    // body("newPassword")
    //   .trim()
    //   .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/)
    //   .withMessage("Length between 8 and 16 characters and At least one lowercase letter(a - z) and At least one uppercase letter(A - Z) and At least one digit(0 - 9) and At least one special character(e.g., !@#$%`)"),
    // query("email")
    //   .isEmail()
    //   .withMessage("Email is invalid")  
  ];
};

export {
  emailValidator,
  usernameValidator,
  passwordValidator,
  userLoginValidator,
  userRegisterValidator,
  changeCurrentPasswordValidator,
  resetForgottenPasswordValidator
};



