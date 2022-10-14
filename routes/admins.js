const router = require('express').Router();
const admins = require('../controllers/admins');
const auth = require('../controllers/auth');
const { checkAdminAuth, checkSuperAdminAuth } = require('../middleware/adminAuth');
const { upload } = require('../middleware/multer');
const {
  validateAdmin,
  isValidated,
  validateLogin,
  changePasswordValidate,
  newPasswordValidate,
} = require('../middleware/validators');

// Admin Register
router.post('/', checkSuperAdminAuth, validateAdmin, isValidated, admins.register);

router.post('/superadmin', validateAdmin, isValidated, admins.registerSuperAdmin);

router.post('/login', validateLogin, isValidated, admins.login);

router.get('/auth', checkAdminAuth, admins.confirmAuth);

router.get('/', checkSuperAdminAuth, admins.getAdmins);

router.put('/:userId/edit', checkSuperAdminAuth, admins.updateAdmin);

router.put('/', checkAdminAuth, upload.single('profile_pic'), admins.update);

router.put('/password', checkAdminAuth, changePasswordValidate, isValidated, auth.changePassword); // Change password route

router.put('/forgot/:email', auth.forgot);
router.put('/verify/:urlToken', auth.verifyToken);
router.put('/password/:userId', newPasswordValidate, isValidated, auth.createPassword);

module.exports = router;
