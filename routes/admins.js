const router = require('express').Router();
const admins = require('../controllers/admins');
const { checkAdminAuth, checkSuperAdminAuth } = require('../middleware/adminAuth');
const { upload } = require('../middleware/multer');
const { validateAdmin, isValidated, validateLogin } = require('../middleware/validators');

// Admin Register
router.post('/', checkSuperAdminAuth, validateAdmin, isValidated, admins.register);

router.post('/super_admin', validateAdmin, isValidated, admins.registerSuperAdmin);

router.post('/login', validateLogin, isValidated, admins.login);

router.get('/auth', checkAdminAuth, admins.confirmAuth);

router.get('/', checkSuperAdminAuth, admins.getAdmins);

router.put('/:userId/edit', checkSuperAdminAuth, admins.updateAdmin);

router.put('/', checkAdminAuth, upload.single('profile_pic'), admins.update);

module.exports = router;
