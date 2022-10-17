/**
 * User auth controllers
 * @author Yousuf Kalim
 */
const Users = require('../models/Users');
const Admins = require('../models/Admins');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const moment = require('moment');
const bcryptSalt = process.env.BCRYPT_SALT || 10;
const tokenSecret = process.env.JWT_SECRET;
const origin = process.env.ORIGIN;

/**
 * Login
 * @param {object} req
 * @param {object} res
 */
exports.login = async (req, res) => {
  try {
    // Getting email and password
    const { phone_number, otp } = req.body;

    // Getting user from db
    // eslint-disable-next-line camelcase
    const user = await Users.findOne({ phone_number: phone_number.replaceAll(' ', '') });

    if (!user) {
      // If user not found
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp) {
      if (process.env.NODE_ENV !== 'dev')
        return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Creating payload with user object
    // eslint-disable-next-line no-underscore-dangle
    delete user._doc.otp;
    const payload = { user };

    // Generating token
    jwt.sign(payload, tokenSecret, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;

      // done
      res.json({ success: true, user, token });
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.sendOtp = async (req, res) => {
  try {
    // Getting email and password
    const { phone_number } = req.body;
    // Getting user from db
    // eslint-disable-next-line camelcase
    const user = await Users.findOne({ phone_number: phone_number.replaceAll(' ', '') });

    if (!user) {
      // If user not found
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let otp = Math.random().toString(10).slice(-4);
    user.otp = otp;
    await user.save();

    //TODO: send OTP via twilio
    return res.json({ success: true, message: 'OTP Sent.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Change Password
 * @param {object} req
 * @param {object} res
 */
exports.changePassword = async (req, res) => {
  try {
    const { _id } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are not same',
      });
    }

    let user = await Admins.findById(_id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let isMatched = bcrypt.compareSync(oldPassword, user.password);

    if (!isMatched) {
      return res.status(400).json({ success: false, message: 'Invalid old Password' });
    }

    isMatched = bcrypt.compareSync(newPassword, user.password);

    if (isMatched) {
      return res
        .status(400)
        .json({ success: false, message: 'New Password cannot be same as old Password' });
    }

    // Generate token
    user.password = bcrypt.hashSync(newPassword, parseInt(bcryptSalt));

    await user.save();

    res.json({ success: true, user, message: 'Password updated successfully.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Forgot password - Send link
 * @param {object} req
 * @param {object} res
 */
exports.forgot = async (req, res) => {
  try {
    let { email } = req.params;
    let user = await Admins.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Generating random password
    let random = Math.random().toString(36).slice(-10);

    // Sending email to user
    sendEmail({
      email,
      subject: 'Visit this link to reset your password.',
      body: `${origin}/password/?token=${random}_${user._id}&email=true`,
    })
      .then(async () => {
        // If email is sent then we have to update the password in db
        user.token = random;
        user.token_expires_in = moment().add(1, 'week').endOf('day');
        await user.save();

        // Done
        res.json({ success: true, message: 'Email sent successfully' });
      })
      .catch((err) => {
        // Error handling
        // eslint-disable-next-line no-console
        console.log('Error ----> ', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
      });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Verify Change Password token
 * @param {object} req
 * @param {object} res
 */
exports.verifyToken = async (req, res) => {
  try {
    let { urlToken } = req.params;

    let [token, id] = urlToken.split('_');

    let user = await Admins.findById(id);

    if (!user || user?.token !== token) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    if (moment(user.token_expires_in).isSameOrBefore(moment())) {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }

    res.json({ success: true, token, user });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Verify Change Password token
 * @param {object} req
 * @param {object} res
 */
exports.createPassword = async (req, res) => {
  try {
    let { userId } = req.params;
    let { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are not same',
      });
    }

    let user = await Admins.findById(userId);

    // Generate token
    user.password = bcrypt.hashSync(password, parseInt(bcryptSalt));
    user.token = null;
    user.token_expires_in = null;
    await user.save();

    res.json({ success: true, message: 'Password created.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Confirm auth
 * @param {object} req
 * @param {object} res
 */
exports.confirmAuth = async (req, res) => {
  // If user authenticated
  res.json({ success: true, user: req.user });
};
