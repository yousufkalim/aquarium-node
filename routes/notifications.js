/**
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const notifications = require('../controllers/notifications');
const { checkAuth } = require('../middleware/checkAuth');
// Read
router.get('/', checkAuth, notifications.get); // Get notifications

router.patch('/:notificationId', checkAuth, notifications.markAsRead);

router.patch('/', checkAuth, notifications.markAllAsRead);

router.put('/', checkAuth, notifications.clearNotifications);

// Export
module.exports = router;
