/**
 * User CRUD routes
 * @author Yousuf Kalim
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const users = require('../controllers/users');
const { checkAuth, checkAdminAuth } = require('../middleware/checkAuth');
const { upload } = require('../middleware/multer');
const { validateUser, isValidated } = require('../middleware/validators');

/**
 * ////////////////////////// Routes /////////////////////////
 * @method post user signup
 * @method get get all users
 * @method get get user by id
 * @method put update user
 * @method delete delete user
 */

// Create - User Signup
router.post('/', checkAdminAuth, validateUser, isValidated, users.create);

// Read
router.get('/', checkAdminAuth, users.getAll); // Get all users at once

router.get('/:userId', checkAuth, users.getById); // Get one user by it's id

// Update
router.put(
  '/:userId',
  checkAuth,
  upload.single('profile_pic'),
  validateUser,
  isValidated,
  users.update,
); // Update a specific user by it's id

// Delete
// router.delete('/:userId', checkAuth, users.delete); // delete a specific user by it's id

// Export
module.exports = router;
