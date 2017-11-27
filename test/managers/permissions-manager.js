const Rx = require('rx');
const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon').createSandbox();
const Factory = require("./../support/factory");

const expect = chai.expect;
chai.use(sinonChai);

Factory.setSandbox(sinon);

const PermissionsManager = require('../../lib/managers/permissions-manager');
const DataManager = require('../../lib/managers/data-manager');

const PERMISSIONS_KEYWORD = 'core.permissions';

describe('PermissionsManager', function () {
  let dataManager;
  let permissionsManager;

  beforeEach(function () {
    dataManager = Factory.create('DataManager');
    permissionsManager = new PermissionsManager(dataManager);
  });

  describe('constructor', function () {
    it("sets it's dataManager property", function () {
      expect(permissionsManager.dataManager).to.eql(dataManager);
    });
  });

  describe('#getPermissionsData', function () {
    let guildId;
    let data;

    beforeEach(function () {
      guildId = 'guildId';
      data = {test: 'data'};
    });

    it('gets data from the dataSource', function (done) {
      dataManager.getGuildData.returns(Rx.Observable.just(data));

      permissionsManager
        .getPermissionsData(guildId)
        .subscribe(
          (savedData) => expect(dataManager.getGuildData).to.have.been.calledWith(guildId, PERMISSIONS_KEYWORD),
          (err) => done(err),
          () => done()
        );
    });

    context('when there is existing data in the dataSource', function () {
      it('returns default data', function (done) {
        let existingData = {
          data: 'existing',
        };
        dataManager.getGuildData.returns(Rx.Observable.just(existingData));

        permissionsManager
          .getPermissionsData(guildId)
          .subscribe(
            (savedData) => expect(savedData).to.eql(existingData),
            (err) => done(err),
            () => done()
          );
      });
    });

    context('when there is no data in the dataSource', function () {
      it('returns default data', function (done) {
        let defaultData = {
          'admin': {
            users: [],
            roles: [],
          },
          'mod': {
            users: [],
            roles: [],
          },
        };
        dataManager.getGuildData.returns(Rx.Observable.just());

        permissionsManager
          .getPermissionsData(guildId)
          .subscribe(
            (savedData) => expect(savedData).to.eql(defaultData),
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#setPermissionsData', function () {
    let guildId;
    let data;

    beforeEach(function () {
      guildId = 'guildId';
      data = {test: 'data'};
    });

    it('sets data in the dataSource', function (done) {
      dataManager.setGuildData.returns(Rx.Observable.just());

      permissionsManager
        .setPermissionsData(guildId, data)
        .subscribe(
          (savedData) => expect(dataManager.setGuildData).to.have.been.calledWith(guildId, PERMISSIONS_KEYWORD, data),
          (err) => done(err),
          () => done()
        );
    });

    it('returns the saved data from the dataSource', function (done) {
      dataManager.setGuildData.returns(Rx.Observable.just('savedData'));

      permissionsManager
        .setPermissionsData(guildId, data)
        .subscribe(
          (savedData) => expect(savedData).to.eql('savedData'),
          (err) => done(err),
          () => done()
        );
    });
  });
});
