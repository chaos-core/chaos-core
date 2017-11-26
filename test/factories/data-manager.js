const Factory = require('../support/factory');

const DataManager = require('../../lib/managers/data-manager');

Factory.define('DataManager', (options) => {
  let data = Object.assign({
    type: 'none',
  }, options);

  return new DataManager(data);
});
