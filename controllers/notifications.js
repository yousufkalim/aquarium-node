/**
 * Notification controller
 * @author Najam Ul Saqib
 */

const Notifications = require('../models/Notifications');
// const Users = require('../models/Users');

exports.get = async (req, res) => {
  try {
    const { _id } = req.user;
    let notifications = await Notifications.find({ technician: _id });

    res.json({ success: true, results: notifications });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    let { notificationId } = req.params;
    let notification = await Notifications.findByIdAndUpdate(
      notificationId,
      {
        read: true,
      },
      { new: true },
    );

    res.json({ success: true, results: notification });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    let { _id } = req.user;
    await Notifications.updateMany(
      {
        technician: _id,
        read: false,
      },
      {
        read: true,
      },
    );

    res.json({ success: true });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.clearNotifications = async (req, res) => {
  try {
    let { _id } = req.user;

    await Notifications.deleteMany({
      technician: _id,
    });

    res.json({ success: true, message: 'Notifications cleared.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
