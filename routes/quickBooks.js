const router = require('express').Router();
const qb = require('../controllers/quickbooks');

router.get('', qb.auth); // login
router.get('/callback', qb.callback); // login callback
router.get('/refresh', qb.qbAuth, qb.refresh);
router.get('/get-data', qb.qbAuth, qb.getData);

module.exports = router;
