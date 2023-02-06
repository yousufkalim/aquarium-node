/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const tasks = require('../controllers/tasks');
const { checkAdminAuth, checkAuth } = require('../middleware/checkAuth');
const {
  isValidated,
  validateTask,
  validateTaskCheckList,
  validateTaskStatus,
  validateTaskId,
  validateDates,
} = require('../middleware/validators');

// Read
router.post('/', checkAdminAuth, validateTask, isValidated, tasks.create);

router.put('/start/:taskId', checkAuth, validateTaskStatus, isValidated, tasks.startTask);
router.put('/complete/:taskId', checkAuth, validateTaskCheckList, isValidated, tasks.completeTask);

router.get('/', checkAdminAuth, tasks.getServices); // get all services
router.get('/service', checkAuth, tasks.getService); // get current / next service
router.get('/whatsnext', checkAuth, tasks.getWhatsNext); // get loadup.
router.get('/report', checkAuth, validateDates, isValidated, tasks.getServicesInDateRange); // get tasks in a date range
router.get('/:taskId', checkAuth, validateTaskId, isValidated, tasks.getTaskById); // get task by id

router.put('/:taskId', validateTask, isValidated, checkAdminAuth, tasks.update);

router.delete('/:taskId', checkAdminAuth, tasks.delete);

// Export
module.exports = router;
