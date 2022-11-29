/**
 * User auth controllers
 * @author Yousuf Kalim
 */
const Users = require('../models/Users');
const Admins = require('../models/Admins');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
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
    const user = await Users.findOne({
      // eslint-disable-next-line camelcase
      phone_number,
      active: true,
    });

    if (!user) {
      // If user not found
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.otp !== otp) {
      if (!['dev', 'QA'].includes(process.env.NODE_ENV))
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
    const user = await Users.findOne({
      // eslint-disable-next-line camelcase
      phone_number,
      active: true,
    });

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
    let user = await Admins.findOne({ email, active: true });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // creating token with user_id as payload.
    let token = jwt.sign({ id: user._id }, tokenSecret, { expiresIn: '8h' });

    // Sending email to user
    sendEmail({
      email,
      subject: 'Visit this link to reset your password.',
      body: `${origin}/password/${token}`,
    })
      .then(async () => {
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
    const { urlToken } = req.params;

    let { id } = jwt.verify(urlToken, tokenSecret);

    const user = await Admins.findById(id);

    // eslint-disable-next-line no-underscore-dangle
    delete user._doc.password;

    res.json({ success: true, results: user });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(403).json({ success: false, message: 'Token expired.' });
  }
};

/**
 * Verify Change Password token
 * @param {object} req
 * @param {object} res
 */
exports.createPassword = async (req, res) => {
  try {
    let { password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password are not same',
      });
    }

    let user = await Admins.findById(req.userId);

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
