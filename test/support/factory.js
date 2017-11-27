const sinon = require('sinon');
const fs = require('fs');

module.exports = {
  sinon: sinon,
  factories: {},
  sequenceNums: {},
  createStack: [],

  setSandbox(sandbox) {
    this.sinon = sandbox;
  },

  define(name, factoryFn) {
    this.factories[name.toLowerCase()] = factoryFn;
  },

  create(name, options = {}) {
    this.createStack.unshift(name.toLowerCase());
    let object = this.factories[name.toLowerCase()](options);
    this.createStack.shift();

    return object;
  },

  sequence(fn) {
    let currentCreate = this.createStack[0];

    if (!this.sequenceNums[currentCreate]) {
      this.sequenceNums[currentCreate] = 0;
    }

    let result = fn(this.sequenceNums[currentCreate]);
    this.sequenceNums[currentCreate]++;

    return result;
  },
};

fs.readdirSync(__dirname + '/../factories').map((file) => require(__dirname + '/../factories/' + file));
