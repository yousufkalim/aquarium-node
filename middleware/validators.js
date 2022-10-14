/**
 * All the validation
 * @author Yousuf Kalim
 */
const { check, validationResult } = require('express-validator');

/*
====================
Validations
====================
*/

// You can create multiple validations strategies (Read express-validator documentation for more details)
// User Signup Validation
exports.validateUser = [
  check('first_name', 'First name is required.').notEmpty().trim(),
  check('last_name', 'Last name is required.').notEmpty().trim(),
  check('phone_number')
    .notEmpty()
    .withMessage('Phone number is required.')
    .custom((value) => {
      let result = /^\([0-9]{3}\)\s*[0-9]{3}-[0-9]{4}$/.test(value);
      if (!result) {
        throw new Error('Phone number can only by in "(XXX) XXX-XXXX" format.');
      }
      return true;
    }),
];
exports.validateAdmin = [
  check('name', 'Name is required.').notEmpty().trim(),
  check('email')
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Invalid email.')
    .trim(),
  check('password')
    .notEmpty()
    .withMessage('Password is required.')
    .isLength({ min: 8 })
    .withMessage('Password must be 8 characters long'),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm password must be 8 characters long'),
];

// Login validation
exports.validateLogin = [
  check('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid Email')
    .trim()
    .toLowerCase(),
  check('password', 'Password is required.').notEmpty(),
];

// Change password validation
exports.changePasswordValidate = [
  check('oldPassword')
    .notEmpty()
    .withMessage('Password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be 8 characters long'),
  check('newPassword')
    .notEmpty()
    .withMessage('New password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm password must be 8 characters long'),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm password must be 8 characters long'),
];

// Password validation
exports.newPasswordValidate = [
  check('password')
    .notEmpty()
    .withMessage('Password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be 8 characters long'),
  check('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required.')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Confirm password must be 8 characters long'),
];

/*
======================
Result
======================
*/

/**
 * To check if request validated successfully or not, according to our validation strategies
 * @param {object} req
 * @param {object} res
 * @param {*} next
 */
exports.isValidated = (req, res, next) => {
  const errors = validationResult(req); // Validating the request by previous middleware's strategy
  if (!errors.isEmpty()) {
    // On error
    res.status(400).send({ success: false, message: errors.array()[0].msg }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
