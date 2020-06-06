const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.cmdEnabled?', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'cmdEnabled?');
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

  describe('!config core cmdEnabled?', function () {
    beforeEach(function () {
      this.message.content = '!config core cmdEnabled?';
    });

    it('does not run the action', async function () {
      sinon.spy(this.action, 'run');
      await this.chaos.testMessage(this.message);
      expect(this.action.run).not.to.have.been.called;
    });

    it('displays a help message', async function () {
      const responses = await this.chaos.testMessage(this.message);

      expect(responses[0]).to.containSubset({
        content: "I'm sorry, but I'm missing some information for that command:",
        embed: {
          title: "cmdEnabled?",
          description: "check if a command is enabled",
          fields: [
            {
              name: "Usage",
              value: `!config core cmdEnabled? <command>`,
            },
            {
              name: "Args",
              value: "**command**: The name of the command to check",
            },
          ],
        },
      });
    });
  });

  describe('!config core cmdEnabled? {command}', function () {
    beforeEach(function () {
      this.message.content = '!config core cmdEnabled? testCommand';
      this.chaos.addCommand('test', {
        name: "testCommand",
      });
    });

    context('when the plugin is disabled', function () {
      it('responds that the plugin is disabled', async function () {
        const responses = await this.chaos.testMessage(this.message);

        expect(responses[0]).to.containSubset({
          content: "Plugin test is disabled.",
        });
      });
    });

    context('when the plugin is enabled', function () {
      beforeEach(async function () {
        const PluginService = this.chaos.getService('core', 'PluginService');
        await PluginService.enablePlugin(this.message.guild.id, 'test');
      });

      context('when the command is enabled', function () {
        it('responds that the command is enabled', async function () {
          const responses = await this.chaos.testMessage(this.message);
          expect(responses[0]).to.containSubset({
            content: "Command `testCommand` is enabled.",
          });
        });
      });

      context('when the command is disabled', function () {
        beforeEach(async function () {
          await this.chaos.getService('core', 'CommandService')
            .disableCommand(this.message.guild.id, 'testCommand');
        });

        it('responds that the command is disabled', async function () {
          const responses = await this.chaos.testMessage(this.message);

          expect(responses[0]).to.containSubset({
            content: "Command `testCommand` is disabled.",
          });
        });
      });
    });
  });
});
