/**
 * Container for all config options that are needed for ChaosCore plugins or services
 */
class ChaosConfig {
  ownerUserId = null;
  loginToken = null;

  discord = {};

  dataSource = {
    type: 'memory',
  };

  web = {
    host: '0.0.0.0',
    port: 3000,
  };

  logger = {};
  strings = {};

  defaultPrefix = '!';

  plugins = [];

  messageOwnerOnBoot = true;

  /**
   * Create a new instance of the config
   * @param options
   */
  constructor(options) {
    Object.assign(this, options);
  }

  /**
   * Verifies that the config has all required fields and is valid
   */
  verifyConfig() {
    if (!this.ownerUserId) { throw new InvalidConfigError("ownerUserId is required"); }
    if (!this.loginToken)  { throw new InvalidConfigError("loginToken is required"); }
  }
}

class InvalidConfigError extends Error {}

module.exports = ChaosConfig;
module.exports.InvalidConfigError = InvalidConfigError;
