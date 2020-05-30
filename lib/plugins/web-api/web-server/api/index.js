const express = require('express');
const createError = require('http-errors');

const router = express.Router();

router.get('/', async (req, res) => {
  res.send({ message: 'Alive and well!' });
});

router.use('/status', require('./status'));
router.use('/guilds', require('./guilds'));

// catch 404 and forward to error handler
router.use(function (req, res, next) {
  next(createError(404));
});

// error handler
router.use(function (err, req, res) {
  res.status(err.status || 500);
  res.send({ 'error': err.message });
});

module.exports = router;
