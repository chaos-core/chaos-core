const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');

const Service = require('../../../models/service');
const { apiRouter } = require('../web-server');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);
    this.chaos.on('chaos.listen', async () => this.startServer());
  }

  startServer() {
    return new Promise((resolve) => {
      const server = this.buildServer();

      const host = this.chaos.config.web.host;
      const port = this.chaos.config.web.port;

      server.listen(port, host, () => {
        this.logger.info(`WebAPI server started at http://${host}:${port}`);
        resolve();
      });
    });
  }

  buildServer() {
    const app = express();

    app.use(expressWinston.logger({
      winstonInstance: this.chaos.logger,
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use((req, res, next) => {
      req.chaos = this.chaos;
      next();
    });

    app.use(apiRouter(this.chaos));

    return app;
  }
}

module.exports = WebApiService;
