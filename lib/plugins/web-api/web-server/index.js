const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');
const path = require('path');

const apiRouter = require('./api-router');

const addChaos = (chaos) => (req, res, next) => {
  req.chaos = chaos;
  next();
};

module.exports.buildServer = (chaos) => {
  chaos.logger.info("Building web server");
  const server = express();

  server.use(expressWinston.logger({ winstonInstance: chaos.logger }));
  server.use(express.static(path.resolve(__dirname, './public')));
  server.use(express.json());
  server.use(express.urlencoded({ extended: false }));
  server.use(cookieParser());
  server.use(addChaos(chaos));

  server.use("/api", apiRouter(chaos));
  server.use('/*', async (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
  });

  return server;
};
