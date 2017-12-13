const sinon = require('sinon');
const glob = require('glob');

const Factory = {
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
    let factory = this.factories[name.toLowerCase()];
    if (!factory) {
      throw new Error(`There is no factory named ${name}.`);
    }

    this.createStack.unshift(name.toLowerCase());
    let object = factory(options);
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

glob(__dirname + '/../factories/**/*.js', (err, files) => {
  files.forEach((file) => require(file));
});

module.exports = Factory;
