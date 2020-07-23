const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const express = require('express');

const Service = require('../../models/service.js');
const webpackConfig = require('../client/webpack.config.js');
const webServer = require('../server');
const {buildPath, clientPath} = require('../paths.js');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);

    this.status = {
      client: 'unavailable',
      server: 'unavailable',
    };

    this.chaos.on('chaos.startup', async () => {
      this.status.client = "Building";
      this.buildClient()
        .then(() => this.status.client = "Ready")
        .catch((error) => this.chaos.handleError(error));

      this.status.server = "Building";
      this.buildServer()
        .then(() => this.startServer())
        .then(() => this.status.server = "Ready")
        .catch((error) => this.chaos.handleError(error));
    });
  }

  async buildClient() {
    return new Promise((resolve, reject) => {
      this.logger.info('Building web client');
      this.generateChaosClientFile();

      let config = {
        ...webpackConfig,
        watch: this.chaos.config.environment === 'development',
        mode: this.chaos.config.environment,
        resolve: {
          ...webpackConfig.resolve,
          alias: {
            ...webpackConfig.resolve.alias,
            ...this.aliasWebClientPlugins(),
          },
        },
      };

      webpack(config, (err, stats) => { // Stats Object
        if (err) {
          this.logger.warn('Webpack error: ', err);
          reject(err);
        } else if (stats.hasErrors()) {
          const errors = stats.toJson().errors;
          this.logger.warn('Webpack errors: ', errors);
          reject(errors);
        } else {
          this.logger.info(
            'Web Client Built:\n' +
            stats.toString({
              entrypoints: false,
              children: false,
              modules: false,
            }),
          );
          resolve();
        }
      });
    });
  }

  async buildServer() {
    this.server = express();
    this.server.use('/assets', express.static(buildPath));
    this.server.use('/api', webServer(this.chaos));
    this.server.use('/*', (req, res) => res.sendFile(path.join(buildPath, 'index.html')));
  }

  async startServer() {
    return new Promise((resolve) => {
      this.logger.info('Starting web server');
      const host = this.chaos.config.web.host;
      const port = this.chaos.config.web.port;

      const serviceInstance = this.server.listen(port, host, () => {
        this.logger.info(`WebAPI server started at http://${host}:${port}`);
        resolve();
      });

      this.chaos.on('chaos.shutdown', () => serviceInstance.close());
    });
  }

  getPluginWebClient(plugin) {
    if (!path.isAbsolute(plugin.webClient)) {
      throw new Error("plugin.webClient must be an absolute path");
    }

    if (path.extname(plugin.webClient) !== '.jsx') {
      throw new Error("plugin.webClient must point to a .jsx entry file");
    }

    if (!fs.existsSync(plugin.webClient)) {
      throw new Error(`${plugin.webClient} does not exist`);
    }

    return {
      jsSafeName: this.jsSafePluginName(plugin),
      appDir: path.dirname(plugin.webClient),
      appFile: path.basename(plugin.webClient),
    };
  }

  /**
   * aliases __chaos-{pluginName} to the webClient folder for each plugin loaded
   * Allows webpack to find the React components for importing into the client.
   */
  aliasWebClientPlugins() {
    const aliases = {};
    this.chaos.pluginManager.plugins.forEach((plugin) => {
      if (!plugin.webClient) return;
      const webClient = this.getPluginWebClient(plugin);
      this.logger.info(`adding webClient plugin for ${plugin.name}`);
      aliases[`__chaos-${webClient.jsSafeName}`] = webClient.appDir;
    });
    return aliases;
  }

  /**
   * Prepares a file that will import all the plugin React Components into the
   * client.
   */
  generateChaosClientFile() {
    let pluginsFile = [];

    const clientConfig = {
      clientId: this.chaos.config.web.clientId,
      clientUrl: this.chaos.config.web.clientUrl,
    };
    pluginsFile.push(`export const config = ${JSON.stringify(clientConfig)};`);

    pluginsFile.push('export const pluginApps = {};');
    this.chaos.pluginManager.plugins.forEach((plugin) => {
      if (!plugin.webClient) return;
      const webClient = this.getPluginWebClient(plugin);
      pluginsFile.push(`import ${webClient.jsSafeName}App from "__chaos-${webClient.jsSafeName}/${webClient.appFile}";`);
      pluginsFile.push(`pluginApps["${webClient.jsSafeName}"] = ${webClient.jsSafeName}App;`);
    });

    fs.writeFileSync(path.resolve(clientPath, 'chaos-client.js'), pluginsFile.join('\n'));
  }

  jsSafePluginName(plugin) {
    return plugin.name.replace(/[^\w]/, '_');
  }
}

module.exports = WebApiService;
