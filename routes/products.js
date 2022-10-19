/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const products = require('../controllers/products');
const { isValidated, validateProduct } = require('../middleware/validators');
const { checkAdminAuth } = require('../middleware/adminAuth');
const { checkAuth } = require('../middleware/checkAuth');
// Read
router.get('/', checkAuth, products.getAll); // Get products
router.get('/:itemId', checkAuth, products.get); // Get products

router.post('/', checkAdminAuth, validateProduct, isValidated, products.create); // Create product

router.put('/:itemId', checkAdminAuth, validateProduct, isValidated, products.update); // Get product

router.delete('/:itemId', checkAdminAuth, products.delete); // Get product

// Export
module.exports = router;
