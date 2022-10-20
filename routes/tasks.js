/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const tasks = require('../controllers/tasks');
const { checkAdminAuth } = require('../middleware/checkAuth');
const { isValidated, validateTask } = require('../middleware/validators');

// Read
router.post('/', checkAdminAuth, validateTask, isValidated, tasks.create);

router.get('/', checkAdminAuth, tasks.getServices);

router.delete('/:taskId', checkAdminAuth, tasks.delete);

// Export
module.exports = router;
