const Service = require('../../../models/service');

const { buildServer } = require('../web-server/server');

class WebApiService extends Service {
  constructor(chaos) {
    super(chaos);
    this.server = buildServer(this.chaos);
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
}

module.exports = WebApiService;
