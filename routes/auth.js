/**
 * User auth routes
 * @author Yousuf Kalim
 */
const router = require('express').Router();
const auth = require('../controllers/auth');
const { checkAuth } = require('../middleware/checkAuth');
const { isValidated, validateTechnicianLogin } = require('../middleware/validators');

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post user login
 * @method get check auth
 * @method put change password
 * @method post forgot email
 */

// Read
router.post('/login', validateTechnicianLogin, isValidated, auth.login); // Get all users at once
router.post('/', validateTechnicianLogin, isValidated, auth.sendOtp); // Get all users at once
router.get('/', checkAuth, auth.confirmAuth);

// Export
module.exports = router;
