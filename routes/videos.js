/**
 * Videos routes
 * @author Najam Ul Saqib
 */
const router = require('express').Router();
const videos = require('../controllers/videos');

router.get('/:dir/:video', videos.videoStream);

// Export
module.exports = router;
