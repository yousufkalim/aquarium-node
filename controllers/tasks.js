/**
 * @author Najam Ul Saqib
 */
const Schedules = require('../models/Schedules');
const Tasks = require('../models/Tasks');
const moment = require('moment');

const DATE_FORMAT = process.env.DATE_FORMAT || 'DD/MM/YYYY';

exports.create = async (req, res) => {
  try {
    let { _id } = req.user;
    let { date, start_time, end_time, technician, type, aquarium } = req.body;

    date = moment(date, DATE_FORMAT, true);

    let startTime = moment(
      // eslint-disable-next-line camelcase
      date.format(DATE_FORMAT) + ' ' + start_time.split(' ').join(':01 '),
      DATE_FORMAT + ' ' + 'HH:mm:ss a',
      true,
    );

    let endTime = moment(
      // eslint-disable-next-line camelcase
      date.format(DATE_FORMAT) + ' ' + end_time,
      DATE_FORMAT + ' ' + 'HH:mm a',
      true,
    );

    let schedule = await Schedules.findOne({ technician, date });
    if (!schedule) {
      schedule = new Schedules({ date, technician });
    }

    let checkAvailability = await Tasks.find({
      technician,
      date,
      $or: [
        { $and: [{ start_time: { $lte: startTime } }, { end_time: { $gte: startTime } }] },
        { $and: [{ start_time: { $lte: endTime } }, { end_time: { $gte: endTime } }] },
        { $and: [{ start_time: { $gte: startTime } }, { end_time: { $lte: endTime } }] },
      ],
    });

    if (checkAvailability.length) {
      return res.json({ success: false, message: 'Time slot not available.' });
    }

    let task = await Tasks.create({
      type,
      date,
      schedule: schedule._id,
      aquarium,
      technician,
      start_time: startTime,
      end_time: endTime,
      admin: _id,
    });

    schedule.tasks.push(task._id);
    await schedule.save();

    res.json({ success: true, message: 'Task created.', task });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.delete = async (req, res) => {
  try {
    let { taskId } = req.params;
    // await Schedules
    let task = await Tasks.findByIdAndDelete(taskId);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    await Schedules.findByIdAndUpdate(task.schedule, { $pull: { tasks: taskId } }, { new: true });

    res.json({ success: true, message: 'Task deleted', results: task });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getServices = async (req, res) => {
  try {
    let admin = req.user;
    let services = await Tasks.find({
      type: 'service',
      admin: admin.role === 'admin' ? admin._id : undefined,
    });
    res.json({ success: true, results: services });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
