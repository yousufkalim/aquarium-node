const { address } = require('../controllers/address');

/**
 * All api routes handles here
 * @author Yousuf Kalim
 * @author Najam Ul Saqib
 */
const router = require('express').Router();

// Parent Routes
router.use('/admins', require('./admins')); // All the user routes
router.use('/users', require('./users')); // All the user routes
router.use('/auth', require('./auth')); // All the auth routes
router.use('/tank', require('./tank')); // All the auth routes
router.use('/checklist', require('./checklist')); // All the auth routes
router.use('/products', require('./products')); // All the auth routes
router.use('/clients', require('./clients')); // All the auth routes
router.use('/schedule', require('./schedule')); // All the auth routes
router.get('/address', address);

// Export
module.exports = router;
