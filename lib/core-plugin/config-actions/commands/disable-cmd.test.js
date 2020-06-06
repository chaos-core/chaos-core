const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.disableCmd', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'disableCmd');
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

  describe('!config core disableCmd', function () {
    beforeEach(function () {
      this.message.content = '!config core disableCmd';
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
          title: "disableCmd",
          description: "Explicitly disable a command.",
          fields: [
            {
              name: "Usage",
              value: `!config core disableCmd <command>`,
            },
            {
              name: "Args",
              value: "**command**: The name of the command to disable",
            },
          ],
        },
      });
    });
  });

  describe('!config core disableCmd {command}', function () {
    beforeEach(function () {
      this.message.content = '!config core disableCmd testCommand';
      this.chaos.addCommand('test', {
        name: "testCommand",
      });
    });

    context('when the command is enabled', function () {
      it('disables the command', async function () {
        const commandService = this.chaos.getService('core', 'CommandService');
        sinon.spy(commandService, 'disableCommand');
        await this.chaos.testMessage(this.message);

        expect(commandService.disableCommand).to.have.been.calledWith(
          this.message.guild.id, 'testCommand',
        );
      });

      it('responds with a success message', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "Command `testCommand` has been disabled.",
        });
      });
    });

    context('when the command is disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'CommandService')
          .disableCommand(this.message.guild.id, 'testCommand');
      });

      it('responds that the command was already disabled', async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "testCommand was already disabled.",
        });
      });
    });
  });
});
