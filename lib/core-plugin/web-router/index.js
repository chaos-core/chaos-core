const express = require('express');

const router = express.Router();
router.use(require('./commands.js'));
router.use(require('./permissions.js'));
router.use(require('./prefix.js'));

module.exports = router;
