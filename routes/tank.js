/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const tanks = require('../controllers/tanks');
const { isValidated, validateTankDetails } = require('../middleware/validators');
const { checkAdminAuth } = require('../middleware/checkAuth');
// Read
router.get('/', checkAdminAuth, tanks.get); // Get tank details

router.post('/', checkAdminAuth, validateTankDetails, isValidated, tanks.create); // Create tank details

router.put('/:itemId', checkAdminAuth, validateTankDetails, isValidated, tanks.update); // Get tank details

router.delete('/:itemId', checkAdminAuth, tanks.delete); // Get tank details

// Export
module.exports = router;
