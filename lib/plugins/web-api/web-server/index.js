const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');

const apiRouter = require('./api-router');

const addChaos = (chaos) => (req, res, next) => {
  req.chaos = chaos;
  next();
};

module.exports = (chaos) => {
  chaos.logger.info("Building web server");

  const server = express();
  server.use(expressWinston.logger({ winstonInstance: chaos.logger }));
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));
  server.use(cookieParser());
  server.use(addChaos(chaos));
  server.use(apiRouter(chaos));

  return server;
};
