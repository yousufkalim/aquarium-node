/**
 * @author Najam Ul Saqib
 */
const Schedules = require('../models/Schedules');
const Aquariums = require('../models/Aquariums');
const Tasks = require('../models/Tasks');
const moment = require('moment');

const DATE_FORMAT = process.env.DATE_FORMAT;

exports.create = async (req, res) => {
  try {
    let { _id } = req.user;
    let { date, start_time, end_time, technician, type, aquarium, repeat } = req.body;

    //? Convert ${repeat} to number if it exists else 1
    repeat = repeat ? +repeat : 1;

    date = moment(date, DATE_FORMAT, true);

    // eslint-disable-next-line no-underscore-dangle
    let _aquarium = await Aquariums.findById(aquarium).populate('client');

    //? save created docs
    let createdDocs = [];
    let service = {
      aquarium: _aquarium,
      start_time: moment(
        // eslint-disable-next-line camelcase
        date.format(DATE_FORMAT) + ' ' + start_time.split(' ').join(':01 '), //? adding one second to avoid conflict
        DATE_FORMAT + ' ' + 'HH:mm:ss a',
        true,
      ),
      end_time: moment(
        // eslint-disable-next-line camelcase
        date.format(DATE_FORMAT) + ' ' + end_time,
        DATE_FORMAT + ' ' + 'HH:mm a',
        true,
      ),
    };

    //? Repeat task creation for ${repeat} times.
    for (let index = 0; index < repeat; index++) {
      //? create date object for service
      let startTime = moment(
        // eslint-disable-next-line camelcase
        date.format(DATE_FORMAT) + ' ' + start_time.split(' ').join(':01 '), //? adding one second to avoid conflict
        DATE_FORMAT + ' ' + 'HH:mm:ss a',
        true,
      );
      //? create date object for service
      let endTime = moment(
        // eslint-disable-next-line camelcase
        date.format(DATE_FORMAT) + ' ' + end_time,
        DATE_FORMAT + ' ' + 'HH:mm a',
        true,
      );
      //? find if schedule exists or else create one for date.
      let schedule = await Schedules.findOne({ technician, date });
      if (!schedule) {
        schedule = new Schedules({ date, technician });
      }

      //? check if time slot is available for task.
      let checkAvailability = await Tasks.find({
        technician,
        date,
        $or: [
          { $and: [{ start_time: { $lte: startTime } }, { end_time: { $gte: startTime } }] },
          { $and: [{ start_time: { $lte: endTime } }, { end_time: { $gte: endTime } }] },
          { $and: [{ start_time: { $gte: startTime } }, { end_time: { $lte: endTime } }] },
        ],
      });

      //? if time slot is available create task else skip task creation
      if (!checkAvailability.length) {
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
        createdDocs.push({ title: `Week ${index + 1}`, success: true, date });
        schedule.tasks.push(task._id);
        await schedule.save();
      } else {
        createdDocs.push({ title: `Week ${index + 1}`, success: false, date });
      }
      date = date.add(1, 'week'); //? Add 1 week in date
    }

    res.json({
      success: true,
      // message: 'Task(s) created.',
      results: {
        service,
        repeat: createdDocs,
      },
    });
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
    }).populate([
      { path: 'technician', select: '-otp' },
      {
        path: 'aquarium',
        populate: {
          path: 'client',
        },
      },
    ]);
    res.json({ success: true, results: services });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.update = async (req, res) => {
  try {
    let { taskId } = req.params;
    let { date, technician, start_time, end_time, type, aquarium } = req.body;
    date = moment(date, DATE_FORMAT, true);
    let task = await Tasks.findById(taskId);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    let startTime = moment(
      // eslint-disable-next-line camelcase
      date.format(DATE_FORMAT) + ' ' + start_time.split(' ').join(':01 '), //? adding one second to avoid conflict
      DATE_FORMAT + ' ' + 'HH:mm:ss a',
      true,
    );
    //? create date object for service
    let endTime = moment(
      // eslint-disable-next-line camelcase
      date.format(DATE_FORMAT) + ' ' + end_time,
      DATE_FORMAT + ' ' + 'HH:mm a',
      true,
    );
    let checkAvailability = await Tasks.find({
      _id: {
        $ne: taskId,
      },
      technician,
      date,
      $or: [
        { $and: [{ start_time: { $lte: startTime } }, { end_time: { $gte: startTime } }] },
        { $and: [{ start_time: { $lte: endTime } }, { end_time: { $gte: endTime } }] },
        { $and: [{ start_time: { $gte: startTime } }, { end_time: { $lte: endTime } }] },
      ],
    });

    if (checkAvailability.length) {
      return res.status(409).json({ success: false, message: 'Time slot not available' });
    }

    if (!date.isSame(moment(task.date), 'date')) {
      //? pull task from previous schedule and create new schedule and push task
      let schedule = await Schedules.findOne({ technician, date });
      if (!schedule) {
        schedule = new Schedules({ date, technician });
      }
      //? Remove task from previous schedule.
      await Schedules.findByIdAndUpdate(task.schedule, { $pull: { tasks: taskId } }, { new: true });
      schedule.tasks.push(task._id);
      await schedule.save();

      task.schedule = schedule._id;
    }

    //? Save required data.
    task.type = type;
    task.aquarium = aquarium;
    task.start_time = startTime;
    task.end_time = endTime;
    task.date = date;
    await task.save();

    res.json({ success: true, message: 'Task Updated. ', results: task });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getService = async (req, res) => {
  try {
    let { _id } = req.user;
    let { status } = req.query;
    let date = moment().startOf('day');
    let services = await Tasks.find({
      date,
      type: 'service',
      technician: _id,
      status: {
        $in: status === 'next' ? ['pending', 'driving'] : ['started'],
      },
    })
      .sort({ start_time: 'asc' })
      .limit(1)
      .populate([
        { path: 'technician', select: '-otp' },
        {
          path: 'aquarium',
          populate: {
            path: 'client',
          },
        },
      ]);
    res.json({ success: true, results: services[0] ?? null });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    let { _id } = req.user;
    let { taskId } = req.params;
    let task = await Tasks.findOne({ _id: taskId, technician: _id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    } else if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Task already completed.' });
    }

    task.checklists = req.body.checklist;
    task.status = 'completed';
    await task.save();
    //TODO: SEND email / message to customer.

    res.json({ success: true, results: task, message: 'Task completed.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.startTask = async (req, res) => {
  try {
    let { _id } = req.user;
    let { taskId } = req.params;
    let { status } = req.body;

    let task = await Tasks.findOne({ _id: taskId, technician: _id });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    } else if (task.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Task already completed.' });
    } else if (task.status === 'started') {
      return res.status(400).json({ success: false, message: 'Task already started.' });
    } else if (task.type !== 'service') {
      task.status = 'started';
      await task.save();
      return res.json({ success: true, results: task, message: 'Task started.' });
    }

    // get tasks sorted by time.
    let services = await Tasks.find({
      date: task.date,
      technician: _id,
    }).sort({ start_time: 'asc' });

    // find index of current task
    let found = services.map((i) => i._id.toString()).indexOf(taskId);

    if (found > -1) {
      // check if service have driving period.
      let drive = services[found - 1];
      if (drive && drive.type === 'drive')
        // Update status of driving to started.
        await Tasks.findByIdAndUpdate(drive._id, {
          status: status === 'driving' ? 'started' : 'completed',
        });
    }

    //TODO: If user is starting service or driving for service send message to customer.
    //TODO: If status is "driving" send message "technician is arriving" else send message "task started".

    task.status = status;
    await task.save();

    res.json({ success: true, results: task, message: 'Task started.' });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    let task = await Tasks.findById(req.params.taskId).populate([
      { path: 'technician', select: '-otp' },
      {
        path: 'aquarium',
        populate: {
          path: 'client',
        },
      },
    ]);
    res.json({ success: true, results: task });
  } catch (err) {
    // Error handling
    // eslint-disable-next-line no-console
    console.log('Error ----> ', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
