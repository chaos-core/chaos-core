const Rx = require('Rx');
const sinon = require('sinon');
const Factory = require('../support/factory');

const DataManager = require('../../lib/managers/data-manager');

Factory.define('DataManager', (options) => {
  let data = Object.assign({
    type: 'none',
  }, options);

  let dataManager =  new DataManager(data);

  sinon.stub(dataManager, 'getGuildData').returns(Rx.Observable.just());
  sinon.stub(dataManager, 'setGuildData').returns(Rx.Observable.just());

  return dataManager;
});
