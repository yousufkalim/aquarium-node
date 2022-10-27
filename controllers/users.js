/**
 * User CRUD controllers
 * @author Yousuf Kalim
 */
const Users = require('../models/Users');
const Schedules = require('../models/Schedules');
const moment = require('moment');

/**
 * Create User - Signup
 * @param {object} req
 * @param {object} res
 */
exports.create = async (req, res) => {
  try {
    let admin = req.user;
    const existingUser = await Users.findOne({ phone_number: req.body.phone_number }); // Finding already existing user

    // Extra Validations
    if (existingUser) {
      // If we found existing user in db
      if (!existingUser.active) {
        existingUser.first_name = req.body.first_name;
        existingUser.last_name = req.body.last_name;
        existingUser.active = true;
        existingUser.admin = admin;
        existingUser.save();

        return res.json({
          success: true,
          admin: existingUser,
          message: 'Technician added.',
        });
      }
      return res.status(409).json({ success: false, message: 'User already exists.' });
    }

    const user = await Users.create({ ...req.body, admin: admin._id }); // Adding user in db

    // Done
    res.json({
      success: true,
      user,
      message: 'Technician added.',
    }); //Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get all users
 * @param {object} req
 * @param {object} res
 */
exports.getAll = async (req, res) => {
  try {
    let admin = req.user;
    const users = await Users.find({ admin: admin._id, active: true }); // Finding all the users from db
    res.json({ success: true, users }); // Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Get user by id
 * @param {object} req
 * @param {object} res
 */
exports.getById = async (req, res) => {
  try {
    const { userId } = req.params; // Getting user id from URL parameter
    const user = await Users.findOne({ _id: userId, active: true }); // Finding user by id
    res.json({ success: true, user }); // Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update user
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    const { userId } = req.params; // Getting user id from URL parameter

    let user = await Users.findOne({
      $and: [{ _id: { $ne: userId } }, { phone_number: req.body.phone_number }],
    });

    if (user) {
      return res
        .status(400)
        .json({ success: false, message: 'User already exists with this phone number.' });
    }

    if (req.file) {
      req.body.profile_pic = req.file.path; // Creating a new property called photo in body object
    }

    user = await Users.findByIdAndUpdate(userId, req.body, { new: true }); // Updating the user
    res.json({ success: true, user }); // Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete user
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    const { userId } = req.params; // Getting user id from URL parameter
    const user = await Users.findByIdAndUpdate(userId, { active: false }, { new: true }); // Deleting the user
    res.json({ success: true, message: 'User deleted.', user }); // Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.attendance = async (req, res) => {
  try {
    let date = moment().startOf('day');
    let { type, reason } = req.body;

    let { _id } = req.user;

    let user = await Users.findById(_id);
    let schedule = await Schedules.findOne({ technician: _id, date });

    if (!schedule) {
      //? if no schedule found
      if (type === 'clock_out') {
        return res.status(400).json({ success: false, message: 'You need to clock-in first.' });
      }
      schedule = new Schedules({ technician: _id, date });
      schedule.attendance.push({
        clock_in: moment(),
      });
      await schedule.save();
      user.current_status = 'clocked_in';
      await user.save();
      return res.json({ success: true, message: 'Clocked in.' });
    } else if (schedule.attendance.length === 0) {
      //? if schedule's attendance array is empty.
      if (type === 'clock_out') {
        return res.status(400).json({ success: false, message: 'You need to clock-in first.' });
      }
      schedule.attendance.push({
        clock_in: moment(),
      });
      await schedule.save();
      user.current_status = 'clocked_in';
      await user.save();
      return res.json({ success: true, message: 'Clocked in.' });
    }

    let lastAttendance = schedule.attendance.at(-1);
    if (typeof lastAttendance.clock_out === 'undefined') {
      //? if user haven't clocked-out yet.
      if (type !== 'clock_out') {
        return res.status(400).json({ success: false, message: 'You need to clock-out first.' });
      } else if (!reason) {
        //? if user want to clock-out but reason is not defined.
        return res.status(400).json({ success: false, message: 'Clock-out reason is required.' });
      }
      schedule.attendance[schedule.attendance.length - 1] = {
        clock_in: lastAttendance.clock_in,
        clock_out: moment(),
        out_reason: reason,
      };
      await schedule.save();
      user.current_status = 'clocked_out';
      await user.save();
      return res.json({ success: true, message: 'Clocked out.' });
    }
    if (type === 'clock_out') {
      return res.status(400).json({ success: false, message: 'You need to clock-in first.' });
    }
    //? Clock in again
    schedule.attendance.push({
      clock_in: moment(),
    });
    await schedule.save();
    user.current_status = 'clocked_in';
    await user.save();
    res.json({ success: true, message: 'Clocked in.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
