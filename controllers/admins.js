/**
 * Admin controllers
 * @author Yousuf Kalim
 */
const Admins = require('../models/Admins');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/sendEmail');
const tokenSecret = process.env.JWT_SECRET;
const bcryptSalt = process.env.BCRYPT_SALT || 10;

/**
 * Create Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.register = async (req, res) => {
  try {
    let { email, password } = req.body; // Getting required fields from body
    const existingAdmin = await Admins.findOne({ email }); // Finding already existing user

    req.body.password = bcrypt.hashSync(password, parseInt(bcryptSalt)); // Hashing the password with salt 8

    // Extra Validations
    if (existingAdmin && existingAdmin.active) {
      // If we found existing user in db
      return res.status(409).json({ success: false, message: 'Admin already exists.' });
    } else if (!existingAdmin.active) {
      existingAdmin.name = req.body.name;
      existingAdmin.password = req.body.password;
      existingAdmin.active = true;

      await existingAdmin.save();
      sendEmail({
        email,
        subject: 'Your account is created',
        body: `Your account is created on ${email} and Password is ${password}.`,
      });
      return res.json({
        success: true,
        admin: existingAdmin,
        message: 'Account created and email sent.',
      }); //Success
    }

    // Creating User
    await Admins.create(req.body).then((admin) => {
      sendEmail({
        email,
        subject: 'Your account is created',
        body: `Your account is created on ${email} and Password is ${password}.`,
      });
      res.json({ success: true, admin, message: 'Account created and email sent.' }); //Success
    });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Create Super Admin - Signup
 * @param {object} req
 * @param {object} res
 */
exports.registerSuperAdmin = async (req, res) => {
  try {
    let { email, password, confirmPassword } = req.body; // Getting required fields from body
    const existingAdmin = await Admins.findOne({ email }); // Finding already existing user

    // Extra Validations
    if (existingAdmin) {
      // If we found existing user in db
      return res.status(409).json({ success: false, message: 'Admin already exists.' });
    } else if (password !== confirmPassword) {
      // Passwords not same
      return res.status(400).json({
        success: false,
        message: 'Password and Confirm Password are not same.',
      });
    }

    // Creating User
    req.body.password = bcrypt.hashSync(password, parseInt(bcryptSalt)); // Hashing the password with salt 8
    const admin = await Admins.create({ ...req.body, role: 'superadmin' }); // Adding user in db

    // Done
    res.json({ success: true, admin }); //Success
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Login
 * @param {object} req
 * @param {object} res
 */
exports.login = async (req, res) => {
  try {
    // Getting email and password
    const { email, password } = req.body;

    // Getting user from db
    let admin = await Admins.findOne({ email, active: true });

    if (!admin) {
      // If admin not found
      return res.status(404).json({ success: false, message: 'Admin not found' });
    } else if (!admin.active) {
      // If admin not found
      return res.status(400).json({ success: false, message: 'Your account is not activated' });
    }

    // Comparing password
    const isMatched = bcrypt.compareSync(password, admin.password);

    if (!isMatched) {
      // If password not matched
      return res.status(400).json({ success: false, message: 'Invalid Password' });
    }

    // Creating payload with admin object
    // eslint-disable-next-line no-underscore-dangle
    delete admin._doc.password; // Removing password from admin object
    const payload = { user: admin };

    // Generating token
    jwt.sign(payload, tokenSecret, { expiresIn: '8h' }, (err, token) => {
      if (err) throw err;

      // done
      res.json({ success: true, admin, token });
    });
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
  res.json({
    success: true,
    admin: req.user,
    token: req.token,
  });
};

/**
 * Get All admins
 * @param {object} req
 * @param {object} res
 */
exports.getAdmins = async (req, res) => {
  try {
    let admins = await Admins.find({ role: 'admin', active: true });
    res.json({ success: true, results: admins });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Update Admin - Super admin update
 * @param {object} req
 * @param {object} res
 */
exports.updateAdmin = async (req, res) => {
  try {
    let { userId } = req.params;
    let body = req.body;

    let alreadyExist = await Admins.findOne({ _id: { $ne: userId }, email: body.email });
    if (alreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: 'Admin already exists with this email.' });
    }

    let user = await Admins.findByIdAndUpdate(userId, body, { new: true });
    res.json({ message: 'Admin updated.', results: user });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
/**
 * Update Admin - logged-in admin
 * @param {object} req
 * @param {object} res
 */
exports.update = async (req, res) => {
  try {
    let { _id } = req.user;
    let body = req.body;

    let alreadyExist = await Admins.findOne({ _id: { $ne: _id }, email: body.email });
    if (alreadyExist) {
      return res
        .status(400)
        .json({ success: false, message: 'Admin already exists with this email.' });
    }

    // Getting url of the image
    if (req.file) {
      req.body.profile_pic = req.file.path; // Creating a new property called photo in body object
    }

    let user = await Admins.findByIdAndUpdate(_id, body, { new: true });
    res.json({ message: 'Admin updated.', results: user });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

/**
 * Delete Admin
 * @param {object} req
 * @param {object} res
 */
exports.delete = async (req, res) => {
  try {
    let { userId } = req.params;

    let user = await Admins.findByIdAndUpdate(userId, { active: false }, { new: true });

    res.json({ message: 'Admin Deleted.', results: user });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
