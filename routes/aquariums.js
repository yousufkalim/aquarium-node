/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const aquariums = require('../controllers/aquariums');
const { checkAuth, checkAdminAuth } = require('../middleware/checkAuth');
const { isValidated, validateAquarium } = require('../middleware/validators');

// Read
router.get('/', checkAdminAuth, aquariums.get);
router.get('/:aquariumId', checkAuth, aquariums.getById);
router.post('/', checkAdminAuth, validateAquarium, isValidated, aquariums.create);
router.put('/:aquariumId', checkAdminAuth, validateAquarium, isValidated, aquariums.update);
router.delete('/:aquariumId', checkAdminAuth, aquariums.delete);

// Export
module.exports = router;
