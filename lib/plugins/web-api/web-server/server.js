const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');

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

  app.use('/api', require('./api'));

  return app;
}

module.exports = { buildServer };
