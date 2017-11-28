const Rx = require('rx');
const Factory = require('../../support/factory');

const DataManager = require('../../../lib/managers/data-manager');

Factory.define('DataManager', (options) => {
  let data = Object.assign({
    type: 'none',
  }, options);

  let dataManager =  new DataManager(data);

  Factory.sinon.stub(dataManager, 'getGuildData').returns(Rx.Observable.just());
  Factory.sinon.stub(dataManager, 'setGuildData').returns(Rx.Observable.just());

  return dataManager;
});
