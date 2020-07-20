const express = require('express');

const router = express.Router();
router.use(require('./guilds.js'));
router.use(require('./plugin.js'));
router.use(require('./prefix.js'));
router.use(require('./commands.js'));

module.exports = router;
