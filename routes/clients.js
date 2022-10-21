/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const clients = require('../controllers/clients');
const { isValidated, validateClient } = require('../middleware/validators');
const { checkAuth, checkAdminAuth } = require('../middleware/checkAuth');

router.use('/aquariums', require('./aquariums')); // All the aquariums routes

// Read
router.get('/', checkAdminAuth, clients.get); // Get clients
router.get('/:clientId', checkAuth, clients.getById); // Get client

router.post('/', checkAdminAuth, validateClient, isValidated, clients.create); // Create client

router.put('/:clientId', checkAdminAuth, validateClient, isValidated, clients.update); // Get product

router.delete('/:clientId', checkAdminAuth, clients.delete); // Get product

// Export
module.exports = router;
