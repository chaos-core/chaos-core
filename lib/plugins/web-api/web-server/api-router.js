const express = require('express');
const { createError } = require('http-errors');

const apiRouter = (chaos) => {
  const router = express.Router();

  router.use(require('./routes/login'));
  router.use(require('./routes/status'));
  router.use(require('./routes/guilds'));

  chaos.pluginManager.plugins.forEach((plugin) => {
    if (!plugin.webRouter) return;
    chaos.logger.info(`adding webRouter for ${plugin.name}`);
    router.use(`/${plugin.name.toLowerCase()}`, plugin.webRouter);
  });

  // catch 404 and forward to error handler
  router.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  router.use(function (err, req, res, _next) {
    res.status(err.status || 500);
    res.send({ 'error': err.message });
  });

  return router;
};

module.exports = apiRouter;