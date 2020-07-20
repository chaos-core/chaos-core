const express = require('express');
const createError = require('http-errors');
const {authorize} = require('./middleware.js');

const apiRouter = (chaos) => {
  const router = express.Router();

  router.use(require('./login.js'));
  router.use(require('./status.js'));

  router.use(authorize);
  router.use(require('./guilds.js'));
  router.use(require('./plugin.js'));

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
    req.chaos.handleError(err);
    res.status(err.status || 500);
    res.send({error: err.message.trim()});
  });

  return router;
};

module.exports = apiRouter;
