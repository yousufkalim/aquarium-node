/**
 * All the validation
 * @author Yousuf Kalim
 * @author Najam Ul Saqib
 */
const { check, validationResult, param, query } = require('express-validator');
const fs = require('fs');
const moment = require('moment');
const DATE_FORMAT = process.env.DATE_FORMAT;

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
    .isNumeric({ no_symbols: true })
    .withMessage('Phone number can only be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be 10 digits long'),
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
exports.validateAdminCreate = [
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
];
exports.validateAdminUpdate = [
  check('name', 'Name is required.').notEmpty().trim(),
  check('email')
    .notEmpty()
    .withMessage('Email is required.')
    .isEmail()
    .withMessage('Invalid email.')
    .trim(),
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
exports.validateTechnicianLogin = [
  check('phone_number')
    .notEmpty()
    .withMessage('Phone number is required.')
    .isNumeric({ no_symbols: true })
    .withMessage('Phone number can only be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be 10 digits long'),
  check('otp')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('OTP can only be numeric.')
    .isLength({ min: 4, max: 4 })
    .withMessage('OTP must be 4 characters.'),
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

exports.validateTankDetails = [
  check('type')
    .notEmpty()
    .withMessage('Type is required.')
    .isIn(['size', 'type', 'material', 'filter'])
    .withMessage('Invalid type.'),
  check('value', 'Value is required.').notEmpty(),
];

exports.validateCheckList = [
  check('type')
    .notEmpty()
    .withMessage('Checklist type is required.')
    .isIn(['service', 'loadup', 'unload'])
    .withMessage('Invalid checklist type.'),
  check('title', 'Title is required.').notEmpty(),
];
exports.validateProduct = [
  check('name', 'Product name is required.').notEmpty(),
  check('price')
    .notEmpty()
    .withMessage('Price is required.')
    .isNumeric({ no_symbols: true })
    .withMessage('Price can only be numeric.'),
];
exports.validateClient = [
  check('first_name', 'First name is required.').notEmpty(),
  check('last_name', 'Last name is required.').notEmpty(),
  check('phone_number')
    .notEmpty()
    .withMessage('Phone number is required.')
    .isNumeric({ no_symbols: true })
    .withMessage('Phone number can only be numeric.')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be 10 digits long'),
  check('email').optional().isEmail().withMessage('Invalid Email').trim().toLowerCase(),
];
exports.validateAquarium = [
  check('address.lat', 'Address is required.').notEmpty(),
  check('address.lng', 'Address is required.').notEmpty(),
  check('service_details', 'Service details are required.').notEmpty(),
  check('client')
    .notEmpty()
    .withMessage('Client is required.')
    .isMongoId()
    .withMessage('Invalid client.'),
  check('tank_details.size', 'Tank size is required.').notEmpty(),
  check('tank_details.type', 'Tank type is required.').notEmpty(),
  check('tank_details.material', 'Tank material is required.').notEmpty(),
  check('tank_details.filter', 'Tank filter is required.').notEmpty(),
];

exports.validateTask = [
  check('technician')
    .notEmpty()
    .withMessage('Technician is required.')
    .isMongoId()
    .withMessage('Invalid technician.'),
  check('aquarium').optional().isMongoId().withMessage('Invalid aquarium.'),
  check('type')
    .notEmpty()
    .withMessage('Type is required.')
    .isIn(['service', 'loadup', 'unload', 'drive', 'lunch', 'break', 'outOfOffice', 'endOfShift'])
    .withMessage('Invalid type.'),
  check('date')
    .notEmpty()
    .withMessage('Date is required.')
    .custom((value) => {
      let date = moment(value, DATE_FORMAT, true);

      let result = date.isValid();
      if (!result) {
        throw new Error('Invalid date.');
      }

      result = date.isSameOrAfter(moment(), 'day');
      if (!result) {
        throw new Error('Past dates are not allowed');
      }

      return true;
    }),
  check('start_time')
    .notEmpty()
    .withMessage('Start time is required.')
    .custom((value) => {
      let result = /^(0[1-9]|1[0-2]):([0-5][0-9]) ((a|p)m|(A|P)M)$/.test(value);
      if (!result) {
        throw new Error('Invalid start time.');
      }

      return true;
    }),
  check('end_time')
    .notEmpty()
    .withMessage('End time is required.')
    .custom((value, { req }) => {
      let result = /^(0[1-9]|1[0-2]):([0-5][0-9]) ((a|p)m|(A|P)M)$/.test(value);
      if (!result) {
        throw new Error('Invalid end time.');
      }

      let start = moment(
        req.body.date + ' ' + req.body.start_time,
        DATE_FORMAT + ' ' + 'HH:mm a',
        true,
      );

      if (moment().isSameOrAfter(start)) {
        throw new Error('Start time should not be a past time.');
      }

      let end = moment(req.body.date + ' ' + value, DATE_FORMAT + ' ' + 'HH:mm a', true);
      result = start.isSameOrAfter(end);
      if (result) {
        throw new Error('End time should be after start time.');
      }

      if (moment(end).diff(moment(start), 'minute') < 30) {
        throw new Error('Minimum task time must be 30 minutes.');
      }

      return true;
    }),
  check('repeat')
    .optional()
    .isNumeric({ no_symbols: true })
    .withMessage('Repeat must be in numeric.'),
];

exports.validateAttendance = [
  check('type')
    .notEmpty()
    .withMessage('Clock type is required.')
    .isIn(['clock_in', 'clock_out'])
    .withMessage('Invalid clock type'),
  check('reason')
    .optional()
    .isIn(['break', 'lunch', 'outOfOffice', 'endOfShift'])
    .withMessage('Invalid clock-out reason'),
];

exports.validateTaskStatus = [
  param('taskId').isMongoId().withMessage('Invalid task id.'),
  check('status')
    .notEmpty()
    .withMessage('status is required.')
    .isIn(['driving', 'started'])
    .withMessage('Invalid status'),
];

exports.validateTaskCheckList = [
  param('taskId').isMongoId().withMessage('Invalid task id.'),
  check('checklist').isArray().withMessage('Check list must be in array'),
  check('checklist.*.title').notEmpty().withMessage('Checklist title is required'),
  check('checklist.*.status').notEmpty().withMessage('Checklist status is required'),
];

exports.validateTaskId = [
  param('taskId').isMongoId().withMessage('Invalid task id.'), //
];

exports.validateDates = [
  query('from')
    .notEmpty()
    .withMessage('')
    .custom((value) => {
      let date = moment(value, DATE_FORMAT, true);

      let result = date.isValid();
      if (!result) {
        throw new Error('Invalid date.');
      }

      return true;
    }),
  query('to')
    .notEmpty()
    .withMessage('')
    .custom((value, { req }) => {
      let date = moment(value, DATE_FORMAT, true);

      let result = date.isValid();
      if (!result) {
        throw new Error('Invalid date.');
      }

      result = date.isSameOrAfter(moment(req.query.from, DATE_FORMAT, true), 'day');
      if (!result) {
        throw new Error('Invalid date range.');
      }

      return true;
    }),
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
    // On error remove files if any
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    if (req.files) {
      req.files.map((f) => fs.unlinkSync(f.path));
    }
    res.status(400).send({ success: false, message: errors.array()[0].msg }); // Sending first error to the client from array of errors
  } else {
    // Validated successfully
    next(); // Pass the request to next middleware or controller
  }
};
