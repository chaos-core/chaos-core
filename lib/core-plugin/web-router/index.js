const express = require('express');

const router = express.Router();
router.use(require('./guilds.js'));
router.use(require('./plugin.js'));

module.exports = router;
