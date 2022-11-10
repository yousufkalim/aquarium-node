const cron = require('node-cron');
const moment = require('moment');
const Schedules = require('../models/Schedules');
const Users = require('../models/Users');

//* Run this task on every midnight
cron.schedule('0 0 0 * * *', async () => {
  const date = moment('2022-10-26T07:00:00.000+00:00').subtract(1, 'day');
  //? Clock out all user object
  await Users.updateMany({ current_status: 'clocked_in' }, { current_status: 'clocked_out' });
  //? Clock out from schedule
  let schedule = await Schedules.find(
    { date: date.startOf('day'), attendance: { $gt: { $size: 1 } } },
    { attendance: { $slice: -1 } },
  );

  schedule = schedule.reduce(
    (data, item) => {
      if (!item.attendance[0].clock_out) {
        data.scheduleIds.push(item._id);
        data.attendanceIds.push(item.attendance[0]._id);
      }
      return data;
    },
    { scheduleIds: [], attendanceIds: [] },
  );

  await Schedules.updateMany(
    {
      _id: { $in: schedule.scheduleIds },
      attendance: { $elemMatch: { _id: { $in: schedule.attendanceIds } } },
    },
    {
      $set: {
        'attendance.$.clock_out': date.endOf('day'),
        'attendance.$.out_reason': 'endOfShift',
      },
    },
  );
});
