const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.enableCmd', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'enableCmd');
    this.message = this.chaos.createMessage();

    this.chaos.addPlugin({
      name: "test",
      configActions: [
        { name: "action1" },
        { name: "action2" },
        { name: "action3" },
      ],
    });

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.member);
  });

  describe('!config core enableCmd', function () {
    beforeEach(function () {
      this.message.content = '!config core enableCmd';
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
          title: "enableCmd",
          description: "Enable a command. Does not override disabled plugins.",
          fields: [
            {
              name: "Usage",
              value: `!config core enableCmd <command>`,
            },
            {
              name: "Args",
              value: "**command**: The name of the command to enable",
            },
          ],
        },
      });
    });
  });

  describe('!config core enableCmd {command}', function () {
    beforeEach(function () {
      this.chaos.addCommand('test', {
        name: "testCommand",
      });

      this.message.content = '!config core enableCmd testCommand';
    });

    context('when the command is enabled', function () {
      it('responds that the command was already enabled', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "testCommand is already enabled.",
        });
      });
    });

    context('when the command is disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'CommandService')
          .disableCommand(this.message.guild.id, 'testCommand');
      });

      it('responds that the command now enabled', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "Command `testCommand` has been enabled.",
        });
      });
    });
  });
});
