const Factory = require('../../support/factory');

const Context = require('../../../lib/models/context');

Factory.define('Context', (options) => {
  let data = Object.assign({
    params: {
      flags: {},
      args: {},
    },
  }, options);

  data.message = data.message || Factory.create('Message');
  data.message = data.message || Factory.create('NixCore');

  return new Context(data.message, data.nix, data.params);
});
