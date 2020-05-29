const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');

const indexRouter = require('./routes/index');

function buildServer(chaos) {
  const app = express();

  app.use(expressWinston.logger({
    winstonInstance: chaos.logger,
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(function (req, res, next) {
    req.chaos = chaos;
    next();
  });

  app.use('/', indexRouter);

  // catch 404 and forward to error handler
  app.use(function (req, res, next) {
    next(createError(404));
  });

  // error handler
  app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.send({ 'error': err.message });
  });

  return app;
}

module.exports = { buildServer };
