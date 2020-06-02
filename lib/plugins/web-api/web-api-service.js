const express = require('express');
const cookieParser = require('cookie-parser');
const expressWinston = require('express-winston');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const Service = require('../../models/service');
const webpackConfig = require('./webpack.config');
const { apiRouter } = require('./web-server');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.startup', async () => {
      await this.buildClient();
      await this.buildServer();
    });

    this.chaos.on('chaos.listen', async () => {
      if (!this.server) return;
      await this.startServer();
    });
  }

  buildClient() {
    return new Promise((resolve, reject) => {
      this.logger.info("Building web client");

      this.generateClientPluginsFile();
      webpackConfig.resolve.alias = this.aliasWebClientPlugins();

      webpack(webpackConfig, (err, stats) => { // Stats Object
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
    this.server = express();

    this.server.use(expressWinston.logger({
      winstonInstance: this.chaos.logger,
    }));
    this.server.use(express.static(path.resolve(__dirname, './web-server/public')));
    this.server.use(express.json());
    this.server.use(express.urlencoded({ extended: false }));
    this.server.use(cookieParser());
    this.server.use((req, res, next) => {
      req.chaos = this.chaos;
      next();
    });

    this.server.use("/api", apiRouter(this.chaos));
    this.server.use('/*', async (req, res) => {
      res.sendFile(path.join(__dirname, './web-server/public/index.html'));
    });
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

  /**
   * aliases __chaos-{pluginName} to the webClient folder for each plugin loaded
   * Allows webpack to find the React components for importing into the client.
   */
  aliasWebClientPlugins() {
    const aliases = {};
    this.chaos.pluginManager.plugins.forEach((plugin) => {
      if (!plugin.webClient) return;

      const jsSafeName = this.jsSafePluginName(plugin);

      this.logger.info(`adding webClient plugin for ${plugin.name}`);
      aliases[`__chaos-${jsSafeName}`] = plugin.webClient;
    });
    return aliases;
  }

  /**
   * Prepares a file that will import all the plugin React Components into the
   * client.
   */
  generateClientPluginsFile() {
    let pluginsFile = "const chaosPlugins = {};\n";

    this.chaos.pluginManager.plugins.forEach((plugin) => {
      if (!plugin.webClient) return;
      if (!fs.existsSync(path.resolve(plugin.webClient, 'app.jsx'))) return;

      const jsSafeName = this.jsSafePluginName(plugin);

      pluginsFile += `import ${jsSafeName}App from "__chaos-${jsSafeName}/app.jsx";\n`;
      pluginsFile += `chaosPlugins["${jsSafeName}"] = ${jsSafeName}App;\n`;
    });

    pluginsFile += "export default chaosPlugins;\n";
    fs.writeFileSync(path.resolve(__dirname, "web-client/chaos-plugins.js"), pluginsFile);
  }

  jsSafePluginName(plugin) {
    return plugin.name.replace(/[^\w]/, "_");
  }
}

module.exports = WebApiService;
