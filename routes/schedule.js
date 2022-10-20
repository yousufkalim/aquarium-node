/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const schedule = require('../controllers/schedule');
const { checkAuth } = require('../middleware/checkAuth');

router.use('/tasks', require('./tasks'));

// Read
router.get('/:technicianId', checkAuth, schedule.get);

// Export
module.exports = router;
