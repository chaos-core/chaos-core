const PermissionsService = require('./permissions-service');
const createChaosStub = require('../../test/create-chaos-stub');
const { PermissionLevelNotFound } = require("../../errors/permission-level-errors");

describe('PermissionsService', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.permissionsService = new PermissionsService(this.chaos);
  });

  describe('#getDatakey', function () {
    beforeEach(function () {
      this.level = "testLevel";
    });

    it('returns a datakey for the permission level', function () {
      expect(this.permissionsService.getDatakey(this.level)).to.eq(`core.permissions.${this.level}`);
    });
  });

  describe('#getPermissionsData', function () {
    beforeEach(function () {
      this.guild = { id: 'guild-00001' };
    });

    context('when the permission level is unknown', function () {
      beforeEach(function () {
        this.level = "foobar";
      });

      it('raises a PermissionLevelNotFound error', async function () {
        try {
          await this.permissionsService.getPermissionsData(this.guild.id, this.level);
        } catch (error) {
          expect(error).to.be.an.instanceOf(PermissionLevelNotFound);
          expect(error.message).to.eq(`The permission level '${this.level}' could not be found.`);
          return;
        }

        throw new Error("Expected an error to be raised");
      });
    });

    context('when the permission level is known', function () {
      beforeEach(function () {
        this.level = "admin";
        this.permissionsService.levels = [this.level];
      });

      context('when there is no data for the level', function () {
        beforeEach(async function () {
          await this.chaos.setGuildData(this.guild.id, `core.permissions.${this.level}`, null);
        });

        it('saves a default set of data', async function () {
          await this.permissionsService.getPermissionsData(this.guild.id, this.level);
          let savedData = await this.chaos.getGuildData(this.guild.id, `core.permissions.${this.level}`);
          expect(savedData).to.deep.eq({ name: "admin", users: [], roles: [] });
        });

        it('emits a default set of data', async function () {
          let data = await this.permissionsService.getPermissionsData(this.guild.id, this.level);
          expect(data).to.deep.equal({ name: 'admin', users: [], roles: [] });
        });
      });

      context('when previous data exists for the level', function () {
        beforeEach(async function () {
          this.data = { users: ["user1"], roles: ["role1"] };
          await this.chaos.setGuildData(this.guild.id, `core.permissions.${this.level}`, this.data);
        });

        it('emits the saved data', async function () {
          let data = await this.permissionsService.getPermissionsData(this.guild.id, this.level);
          expect(data).to.deep.eq(this.data);
        });
      });
    });
  });

  describe('#setPermissionsData', function () {
    beforeEach(function () {
      this.guild = { id: 'guild-00001' };
      this.level = "admin";
      this.data = {
        users: ["user1"],
        roles: ["role1"],
      };
    });

    context('when the permission level is unknown', function () {
      beforeEach(function () {
        this.level = "foobar";
      });

      it('raises a PermLevelNotFoundError error', async function () {
        try {
          await this.permissionsService.setPermissionsData(this.guild.id, this.level, this.data);
        } catch (error) {
          expect(error).to.be.an.instanceOf(PermissionLevelNotFound);
          expect(error.message).to.eq(`The permission level '${this.level}' could not be found.`);
          return;
        }

        throw new Error("Expected an error to be raised");
      });
    });

    context('when the permission level is known', function () {
      beforeEach(function () {
        this.level = "admin";
        this.chaos.addPermissionLevel(this.level);
      });

      it('saves the passed data to the guild data', async function () {
        await this.permissionsService.setPermissionsData(this.guild.id, this.level, this.data);
        let savedData = await this.chaos.getGuildData(this.guild.id, `core.permissions.${this.level}`);
        expect(savedData).to.deep.eq(this.data);
      });

      it('emits the saved data', async function () {
        let savedData = await this.permissionsService.setPermissionsData(this.guild.id, this.level, this.data);
        expect(savedData).to.deep.eq(this.data);
      });
    });
  });

  describe('#addUser', function () {
    beforeEach(function () {
      this.guild = { id: "guild-00001" };
      this.level = "admin";
      this.user = { id: "user-00001", username: "exampleUser" };

      this.permissionsService.levels = ["admin"];
    });

    it('adds the user to the given permission level', async function () {
      await this.permissionsService.addUser(this.guild, this.level, this.user);
      let savedData = await this.permissionsService.getPermissionsData(this.guild.id, this.level);
      expect(savedData).to.deep.eq(
        {
          name: 'admin',
          users: [this.user.id],
          roles: [],
        },
      );
    });

    context('when the permission level does not exist', function () {
      beforeEach(function () {
        this.level = "foobar";
      });

      it('raises a PermLevelNotFoundError', async function () {
        try {
          await this.permissionsService.addUser(this.guild, this.level, this.user);
        } catch (error) {
          expect(error).to.be.an.instanceOf(PermissionLevelNotFound);
          expect(error.message).to.eq(`The permission level '${this.level}' could not be found.`);
          return;
        }

        throw new Error("Expected an error to be raised");
      });
    });

    context('when the user has already been added to the permission level', function () {
      beforeEach(async function () {
        await this.permissionsService.addUser(this.guild, this.level, this.user);
      });

      it('raises a PermLevelError', async function () {
        try {
          await this.permissionsService.addUser(this.guild, this.level, this.user);
        } catch (error) {
          expect(error.name).to.eq('PermLevelError');
          expect(error.message).to.eq(`The user ${this.user.username} already has the permission level ${this.level}`);
          return;
        }

        throw new Error("Expected an error to be raised");
      });
    });
  });
})
;
