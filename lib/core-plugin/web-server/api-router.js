const express = require('express');
const createError = require('http-errors');

const authorize = async (req, res, next) => {
  if (!req.headers["authorization"]) {
    return next(createError(401, "Missing Authorization Header"));
  }

  const [type, token] = req.headers["authorization"].split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return next(createError(401, "Invalid Authorization Header"));
  }

  const webAuthService = req.chaos.getService("core", "WebAuthService");
  const user = await webAuthService.decodeAuthToken(token);
  if (!user.id) {
    return next(createError(401, "Invalid Authorization Token"));
  }

  req.user = user;
  next();
};

const apiRouter = (chaos) => {
  const router = express.Router();

  router.use(require('./routes/login.js'));

  router.use(authorize);
  router.use(require('./routes/status.js'));
  router.use(require('./routes/guilds.js'));
  router.use(require('./routes/plugin.js'));

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
