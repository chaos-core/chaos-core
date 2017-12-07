const Rx = require('rx');
const Factory = require('../../support/factory');

const DataManager = require('../../../lib/managers/data-manager');

Factory.define('DataManager', (options) => {
  let data = Object.assign({
    type: 'none',
  }, options);

  let dataManager =  new DataManager(data);

  Factory.sinon.stub(dataManager, 'getGuildData').callsFake((guildId, keyword) => Rx.Observable.just());
  Factory.sinon.stub(dataManager, 'setGuildData').callsFake((guildId, keyword, data) => Rx.Observable.just(data));

  return dataManager;
});
