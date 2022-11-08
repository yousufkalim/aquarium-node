/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const schedule = require('../controllers/schedule');
const { checkAuth, checkUserId } = require('../middleware/checkAuth');

router.use('/tasks', require('./tasks'));

// Read
router.get('/:technicianId', checkAuth, checkUserId('technicianId'), schedule.get);

// Export
module.exports = router;
