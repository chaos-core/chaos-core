const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');
const webpack = require('webpack');
const path = require('path');

const Service = require('../../../models/service');
const { apiRouter } = require('../web-server');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);
    this.chaos.on('chaos.listen', () => this.onListen());
  }

  async onListen() {
    this.client = await this.buildClient();
    this.server = await this.buildServer();
    await this.startServer();
  }

  buildClient() {
    return new Promise((resolve, reject) => {
      this.logger.info("Building web client");
      const webpackResolve = {
        alias: {},
      };

      this.chaos.pluginManager.plugins.forEach((plugin) => {
        if (!plugin.webClient) return;
        this.logger.info(`adding webClient plugin for ${plugin.name}`);
        webpackResolve.alias[`chaos-plugin-${plugin.name}`] = plugin.webClient;
      });

      webpack({
        entry: path.resolve(__dirname, '../web-client/src/index.js'),
        output: {
          path: path.resolve(__dirname, '../web-client/build'),
          filename: 'chaos-client.bundle.js',
        },
        resolve: webpackResolve,
        externals: [
          (context, request, callback) => {
            if (/^\$chaos$/.test(request)) {
              return callback(null, 'commonjs ' + request);
            }
            callback();
          },
        ],
      }, (err, stats) => { // Stats Object
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(stats.toJson().errors);
        } else {
          resolve();
        }
      });
    });
  }

  buildServer() {
    this.logger.info("Building web server");
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

  startServer() {
    return new Promise((resolve) => {
      this.logger.info("Starting web server");
      const host = this.chaos.config.web.host;
      const port = this.chaos.config.web.port;

      this.server.listen(port, host, () => {
        this.logger.info(`WebAPI server started at http://${host}:${port}`);
        resolve();
      });
    });
  }
}

module.exports = WebApiService;
