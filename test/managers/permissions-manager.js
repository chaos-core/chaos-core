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

  before(function (done) {
    Factory.loadFactories(done);
  });

  beforeEach(function () {
    dataManager = Factory.create('DataManager');
    permissionsManager = new PermissionsManager(dataManager);
  });

  afterEach(function () { sinon.restore(); });

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
    let existingData;
    let guildId;
    let data;

    beforeEach(function () {
      existingData = {
        'admin': {
          users: ['adminUser1', 'adminUser2'],
          roles: ['adminRole1', 'adminRole2'],
        },
        'mod': {
          users: ['modUser1', 'modUser2'],
          roles: ['modRole1', 'modRole2'],
        },
      };

      guildId = 'guildId';
      data = {test: 'data'};
    });

    it('sets data in the dataSource', function (done) {
      permissionsManager
        .setPermissionsData(guildId, data)
        .subscribe(
          (savedData) => expect(dataManager.setGuildData).to.have.been.calledWith(guildId, PERMISSIONS_KEYWORD, data),
          (err) => done(err),
          () => done()
        );
    });

    it('returns the saved data from the dataSource', function (done) {
      permissionsManager
        .setPermissionsData(guildId, data)
        .subscribe(
          (savedData) => expect(savedData).to.eql(data),
          (err) => done(err),
          () => done()
        );
    });
  });

  describe('#addUser', function () {
    let user;
    let guild;

    beforeEach(function () {
      guild = Factory.create('Guild');
      user = Factory.create('User');
    });

    context('when there is existing data', function () {
      let existingData;

      beforeEach(function () {
        existingData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        dataManager.getGuildData.withArgs(guild.id, PERMISSIONS_KEYWORD).returns(Rx.Observable.just(existingData));
      });

      it('adds the user into the existing data', function (done) {
        let expectedData = {
          'admin': {
            users: ['adminUser1', 'adminUser2', user.id],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        permissionsManager.addUser(guild, 'admin', user)
          .subscribe(
            (savedData) => {
              expect(dataManager.setGuildData).to.have.been.calledWith(guild.id, PERMISSIONS_KEYWORD, expectedData);
            },
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#removeUser', function () {
    let role;
    let guild;

    beforeEach(function () {
      guild = Factory.create('Guild');
      user = Factory.create('User');
    });

    context('when there is existing data', function () {
      let existingData;

      beforeEach(function () {
        existingData = {
          'admin': {
            users: ['adminUser1', user.id, 'adminUser2'],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        dataManager.getGuildData.withArgs(guild.id, PERMISSIONS_KEYWORD).returns(Rx.Observable.just(existingData));
      });

      it('removes the user from the data', function (done) {
        let expectedData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        permissionsManager.removeUser(guild, 'admin', user)
          .subscribe(
            () => expect(dataManager.setGuildData).to.have.been.calledWith(guild.id, PERMISSIONS_KEYWORD, expectedData),
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#addRole', function () {
    let role;
    let guild;

    beforeEach(function () {
      guild = Factory.create('Guild');
      role = Factory.create('Role');
    });

    context('when there is existing data', function () {
      let existingData;

      beforeEach(function () {
        existingData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        dataManager.getGuildData.withArgs(guild.id, PERMISSIONS_KEYWORD).returns(Rx.Observable.just(existingData));
      });

      it('adds the role to the data', function (done) {
        let expectedData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2', role.id],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        permissionsManager.addRole(guild, 'admin', role)
          .subscribe(
            () => expect(dataManager.setGuildData).to.have.been.calledWith(guild.id, PERMISSIONS_KEYWORD, expectedData),
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#removeRole', function () {
    let role;
    let guild;

    beforeEach(function () {
      guild = Factory.create('Guild');
      role = Factory.create('Role');
    });

    context('when there is existing data', function () {
      let existingData;

      beforeEach(function () {
        existingData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2', role.id],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        dataManager.getGuildData.withArgs(guild.id, PERMISSIONS_KEYWORD).returns(Rx.Observable.just(existingData));
      });

      it('removes the role from the data', function (done) {
        let expectedData = {
          'admin': {
            users: ['adminUser1', 'adminUser2'],
            roles: ['adminRole1', 'adminRole2'],
          },
          'mod': {
            users: ['modUser1', 'modUser2'],
            roles: ['modRole1', 'modRole2'],
          },
        };

        permissionsManager.removeRole(guild, 'admin', role)
          .subscribe(
            () => expect(dataManager.setGuildData).to.have.been.calledWith(guild.id, PERMISSIONS_KEYWORD, expectedData),
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#hasPermission', function () {
    let savedPermissions;

    let guild;
    let member;

    let command;
    let cmdContext;
    let response;

    beforeEach(function () {
      savedPermissions = {
        'admin': {
          users: [],
          roles: [],
        },
        'mod': {
          users: [],
          roles: [],
        },
      };
      guild = Factory.create('Guild');
      member = Factory.create('GuildMember', {guild});
      command = Factory.create('Command', { permissions: ['admin'] });

      let nix = Factory.create("NixCore", {autoSetOwner: true});
      cmdContext = Factory.create('Context', {nix});
      cmdContext.message.member = member;

      sinon.stub(permissionsManager, 'getPermissionsData').callsFake(() => Rx.Observable.return(savedPermissions));
    });

    context('when the channel is not a text channel', function () {
      beforeEach(function () {
        cmdContext.channel.type = 'dm';
      });

      it('returns true', function (done) {
        permissionsManager.hasPermission(command, cmdContext, response)
          .subscribe(
            (result) => expect(result).to.eql(true),
            (err) => done(err),
            () => done()
          );
      });
    });

    context('when the user does not have permission', function () {
      it('returns false', function (done) {
        permissionsManager.hasPermission(command, cmdContext, response)
          .subscribe(
            (result) => expect(result).to.eql(false),
            (err) => done(err),
            () => done()
          );
      });

      context('when the user is the bot owner', function () {
        beforeEach(function () {
          cmdContext.nix._owner = member;
        });

        it('returns true', function (done) {
          permissionsManager.hasPermission(command, cmdContext, response)
            .subscribe(
              (result) => expect(result).to.eql(true),
              (err) => done(err),
              () => done()
            );
        });
      });

      context('when the user is the guild owner', function () {
        beforeEach(function () {
          cmdContext.guild.ownerID = member.user.id;
        });

        it('returns true', function (done) {
          permissionsManager.hasPermission(command, cmdContext, response)
            .subscribe(
              (result) => expect(result).to.eql(true),
              (err) => done(err),
              () => done()
            );
        });
      });
    });

    context('when the user has the permission level directly', function () {
      beforeEach(function () {
        savedPermissions.admin.users.push(member.id);
      });

      it('returns true', function (done) {
        permissionsManager.hasPermission(command, cmdContext, response)
          .subscribe(
            (result) => expect(result).to.eql(true),
            (err) => done(err),
            () => done()
          );
      });
    });

    context('when the user has the permission level through a role', function () {
      let role;

      beforeEach(function () {
        role = Factory.create('Role', {guild});
        member.addRole(role);
        savedPermissions.admin.roles.push(role.id);
      });

      it('returns true', function (done) {
        permissionsManager.hasPermission(command, cmdContext, response)
          .subscribe(
            (result) => expect(result).to.eql(true),
            (err) => done(err),
            () => done()
          );
      });
    });
  });

  describe('#filterHasPermission', function () {
    let command;
    let cmdContext;
    let response;

    beforeEach(function () {
      command = {};
      cmdContext = {};
      response = {};
    });

    context("when the user does not have permission", function() {
      beforeEach(function () {
        sinon.stub(permissionsManager, 'hasPermission').returns(Rx.Observable.return(false));
      });

      it('does not stream any elements', function (done) {
        let nextSpy = sinon.spy();

        permissionsManager.filterHasPermission(command, cmdContext, response)
          .subscribe(
            (item) => nextSpy(item),
            (err) => done(err),
            () => {
              expect(nextSpy).not.to.have.been.called;
              done();
            }
          );
      });
    });

    context("when the user does have permission", function () {
      beforeEach(function () {
        sinon.stub(permissionsManager, 'hasPermission').returns(Rx.Observable.return(true));
      });

      it('does not stream any elements', function (done) {
        let nextSpy = sinon.spy();

        permissionsManager.filterHasPermission(command, cmdContext, response)
          .subscribe(
            (item) => nextSpy(item),
            (err) => done(err),
            () => {
              expect(nextSpy).to.have.been.calledWith(true);
              done();
            }
          );
      });
    });
  });
});
