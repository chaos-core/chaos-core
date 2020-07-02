const deepmerge = require('deepmerge');

const defaultOptions = {
  ownerUserId: null,
  loginToken: null,
  environment: 'production',

  discord: {},

  dataSource: {
    type: 'memory',
  },

  web: {
    enabled: true,
    host: '0.0.0.0',
    port: 3000,
    clientId: null,
    clientSecret: null,
    clientUrl: "http://localhost:3000",
    jwtSecret: null,
  },

  logger: {},
  strings: {},

  defaultPrefix: '!',

  plugins: [],

  messageOwnerOnBoot: true,
};

/**
 * Container for all config options that are needed for ChaosCore plugins or services
 */
class ChaosConfig {
  /**
   * Create a new instance of the config
   * @param options
   */
  constructor(options) {
    Object.assign(this, deepmerge(defaultOptions, options));
  }

  /**
   * Verifies that the config has all required fields and is valid
   */
  verifyConfig() {
    if (!this.ownerUserId) { throw new InvalidConfigError("ownerUserId is required"); }
    if (!this.loginToken) { throw new InvalidConfigError("loginToken is required"); }

    if (this.web.enabled) {
      if (!this.web.clientId) { throw new InvalidConfigError("web.clientId is required"); }
      if (!this.web.clientSecret) { throw new InvalidConfigError("web.clientSecret is required"); }
      if (!this.web.jwtSecret) { throw new InvalidConfigError("web.jwtSecret is required"); }
    }
  }
}

class InvalidConfigError extends Error {}

module.exports = ChaosConfig;
module.exports.InvalidConfigError = InvalidConfigError;
