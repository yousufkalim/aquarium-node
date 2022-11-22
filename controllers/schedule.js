/**
 * @author Najam Ul Saqib
 */
const Schedules = require('../models/Schedules');
const Users = require('../models/Users');
const moment = require('moment');
const DATE_FORMAT = process.env.DATE_FORMAT || 'DD/MM/YYYY';

exports.get = async (req, res) => {
  try {
    let { date } = req.query;
    let { technicianId } = req.params;

    date = moment(date, DATE_FORMAT, true);

    if (!date.isValid()) {
      return res.status(400).json({ success: false, message: 'Invalid date.' });
    }

    let schedule = await Schedules.findOne({ technician: technicianId, date })
      .populate({
        path: 'tasks',
        populate: {
          path: 'aquarium',
          populate: {
            path: 'client',
          },
        },
      })
      .populate('technician');

    if (!schedule) {
      let tech = await Users.findOne({ _id: technicianId });

      return res.json({
        success: true,
        message: 'No schedule found.',
        results: {
          technician: tech,
        },
      });
    }

    res.json({ success: true, results: schedule });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
