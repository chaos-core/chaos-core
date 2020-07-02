const ChaosCore = require('../chaos-core');
const stubChaosBot = require('./stub-chaos-bot');

const createChaosStub = (config = {}) => {
  return stubChaosBot(new ChaosCore({
    ownerUserId: '100000000',
    loginToken: 'example-token',
    logger: { level: 'warn' },
    web: { enabled: false },
    ...config,
  }));
};

module.exports = createChaosStub;
