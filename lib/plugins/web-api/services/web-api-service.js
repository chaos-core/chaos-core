const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');

const Service = require('../../../models/service');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);
    this.server = this.buildServer();
    this.chaos.on('chaos.listen', async () => this.startServer());
  }

  startServer() {
    return new Promise((resolve) => {
      const host = this.chaos.config.web.host;
      const port = this.chaos.config.web.port;

      this.server.listen(port, host, () => {
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

    app.use('/api', require('../web-server'));

    return app;
  }
}

module.exports = WebApiService;
