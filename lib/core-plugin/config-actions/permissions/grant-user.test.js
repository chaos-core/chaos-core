const { Collection, SnowflakeUtil } = require('discord.js');

const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.grantUser', function () {
  const userId = SnowflakeUtil.generate();

  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'grantUser');
    this.message = this.chaos.createMessage({
      guild: {
        members: new Collection(),
      },
    });

    this.chaos.addPlugin({
      name: "test",
      permissionLevels: ['testLevel'],
    });

    this.member = {
      id: userId,
      displayName: 'testNickname',
      nickname: 'testNickname',
      user: {
        id: userId,
        username: "testUser",
        tag: "testUser#0001",
      },
    };
    this.message.guild.members.set(this.member.id, this.member);

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.member);
  });

  describe('!config core grantUser', function () {
    beforeEach(function () {
      this.message.content = '!config core grantUser';
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
          title: "grantUser",
          description: "Add a user to a permission level.",
          fields: [
            {
              name: "Usage",
              value: '!config core grantUser <user> <level>',
            },
            {
              name: "Args",
              value: [
                "**user**: the user to add",
                "**level**: the permission level to add",
              ].join("\n"),
            },
          ],
        },
      });
    });
  });

  describe('!config core grantUser {user}', function () {
    beforeEach(function () {
      this.message.content = '!config core grantUser testUser';
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
          title: "grantUser",
          description: "Add a user to a permission level.",
          fields: [
            {
              name: "Usage",
              value: '!config core grantUser <user> <level>',
            },
            {
              name: "Args",
              value: [
                "**user**: the user to add",
                "**level**: the permission level to add",
              ].join("\n"),
            },
          ],
        },
      });
    });
  });

  describe('!config core grantUser {user} {level}', function () {
    context('when the level does not exist', function () {
      beforeEach(function () {
        this.message.content = `!config core grantUser ${userId} nullLevel`;
      });

      it('displays an error message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "The permission level 'nullLevel' could not be found.",
        });
      });
    });

    context('when the user does not exist', function () {
      beforeEach(function () {
        this.message.content = `!config core grantUser nullUser nullLevel`;
      });

      it('displays an error message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "The user 'nullUser' could not be found",
        });
      });
    });

    context('when the user and level exist', function () {
      [{
        paramType: "userId",
        paramValue: userId,
      }, {
        paramType: "user tag",
        paramValue: "testUser#0001",
      }, {
        paramType: "user username",
        paramValue: "testUser",
      }, {
        paramType: "user nickname",
        paramValue: "testNickname",
      }, {
        paramType: "user mention",
        paramValue: `<@${userId}>`,
      }, {
        paramType: "user mobile mention",
        paramValue: `<@!${userId}>`,
      }].forEach(({ paramType, paramValue }) => {
        context(`when the user is given by ${paramType}`, function () {
          beforeEach(function () {
            this.message.content = `!config core grantUser ${paramValue} testLevel`;
          });

          it('displays an success message', async function () {
            let responses = await this.chaos.testMessage(this.message);
            expect(responses[0]).to.containSubset({
              content: "Added `testUser` to `testLevel`.",
            });
          });

          it('adds the member to the permission level', async function () {
            const permissionsService = this.chaos.getService('core', 'PermissionsService');
            sinon.spy(permissionsService, 'addUser');
            await this.chaos.testMessage(this.message);
            expect(permissionsService.addUser).to.have.been.calledWith(
              this.message.guild, 'testLevel', this.member.user,
            );
          });
        });
      });
    });
  });
});
