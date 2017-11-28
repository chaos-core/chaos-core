const Factory = require('../../support/factory');

const Command = require('../../../lib/models/command');

Factory.define('Command', (options) => {
  let data = Object.assign({
    name: Factory.sequence((index) => 'testCommand' + index),
  }, options);

  return new Command(data);
});
