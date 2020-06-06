const { Collection, SnowflakeUtil } = require('discord.js');

const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.grantRole', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'grantRole');
    this.message = this.chaos.createMessage({
      guild: {
        roles: new Collection(),
      },
    });

    this.chaos.addPlugin({
      name: "test",
      permissionLevels: ['testLevel'],
    });

    this.role = {
      id: SnowflakeUtil.generate(),
      name: "testRole",
    };
    this.message.guild.roles.set(this.role.id, this.role);

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.member);
  });

  describe('!config core grantRole', function () {
    beforeEach(function () {
      this.message.content = '!config core grantRole';
    });

    it('does not run the action', async function () {
      sinon.spy(this.action, 'run');
      await this.chaos.testMessage(this.message);
      expect(this.action.run).not.to.have.been.called;
    });

    it('displays a help message', async function () {
      let responses = await this.chaos.testMessage(this.message);
      expect(responses[0]).to.containSubset({
        content: "I'm sorry, but I'm missing some information for that command:",
        embed: {
          title: "grantRole",
          description: "Add a role to a permission level.",
          fields: [
            {
              name: "Usage",
              value: '!config core grantRole <role> <level>',
            },
            {
              name: "Args",
              value: [
                "**role**: the name or mention of the role to add",
                "**level**: the permission level to add",
              ].join("\n"),
            },
          ],
        },
      });
    });
  });

  describe('!config core grantRole {role}', function () {
    beforeEach(function () {
      this.message.content = '!config core grantRole testRole';
    });

    it('does not run the action', async function () {
      sinon.spy(this.action, 'run');
      await this.chaos.testMessage(this.message);
      expect(this.action.run).not.to.have.been.called;
    });

    it('displays a help message', async function () {
      let responses = await this.chaos.testMessage(this.message);
      expect(responses[0]).to.containSubset({
        content: "I'm sorry, but I'm missing some information for that command:",
        embed: {
          title: "grantRole",
          description: "Add a role to a permission level.",
          fields: [
            {
              name: "Usage",
              value: '!config core grantRole <role> <level>',
            },
            {
              name: "Args",
              value: [
                "**role**: the name or mention of the role to add",
                "**level**: the permission level to add",
              ].join("\n"),
            },
          ],
        },
      });
    });
  });

  describe('!config core grantRole {role} {level}', function () {
    context('when the level does not exist', function () {
      beforeEach(function () {
        this.message.content = '!config core grantRole testRole nullLevel';
      });

      it('displays an error message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "The permission level 'nullLevel' could not be found.",
        });
      });
    });

    context('when the role does not exist', function () {
      beforeEach(function () {
        this.message.content = '!config core grantRole nullRole testLevel';
      });

      it('displays an error message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "The role 'nullRole' could not be found",
        });
      });
    });

    context('when the role and level exist', function () {
      beforeEach(function () {
        this.message.content = '!config core grantRole testRole testLevel';
      });

      it('displays an success message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "Added `testRole` to `testLevel`.",
        });
      });

      it('adds the role to the permission level', async function () {
        const permissionsService = this.chaos.getService('core', 'PermissionsService');
        sinon.spy(permissionsService, 'addRole');
        await this.chaos.testMessage(this.message);
        expect(permissionsService.addRole).to.have.been.calledWith(
          this.message.guild, 'testLevel', this.role,
        );
      });
    });
  });
});
