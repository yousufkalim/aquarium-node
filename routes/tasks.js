/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const tasks = require('../controllers/tasks');
const { checkAdminAuth, checkAuth } = require('../middleware/checkAuth');
const { isValidated, validateTask, validateTaskCheckList } = require('../middleware/validators');

// Read
router.post('/', checkAdminAuth, validateTask, isValidated, tasks.create);
router.post('/complete/:taskId', checkAuth, validateTaskCheckList, isValidated, tasks.completeTask);

router.get('/', checkAdminAuth, tasks.getServices);
router.get('/service', checkAuth, tasks.getNextService);

router.put('/:taskId', validateTask, isValidated, checkAdminAuth, tasks.update);

router.delete('/:taskId', checkAdminAuth, tasks.delete);

// Export
module.exports = router;
