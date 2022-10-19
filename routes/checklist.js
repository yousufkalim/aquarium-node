/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const checklist = require('../controllers/checklist');
const { isValidated, validateCheckList } = require('../middleware/validators');
const { checkAdminAuth } = require('../middleware/adminAuth');
const { checkAuth } = require('../middleware/checkAuth');
const { upload } = require('../middleware/multer');
// Read
router.get('/', checkAuth, checklist.get); // Get tank details

router.post(
  '/',
  checkAdminAuth,
  upload.single('attachment'),
  validateCheckList,
  isValidated,
  checklist.create,
); // Create tank details

router.put(
  '/:itemId',
  checkAdminAuth,
  upload.single('attachment'),
  validateCheckList,
  isValidated,
  checklist.update,
); // Get tank details

router.delete('/:itemId', checkAdminAuth, checklist.delete); // Get tank details

// Export
module.exports = router;
