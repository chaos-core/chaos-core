const createChaosStub = require('../../test/create-chaos-stub');

describe('Config: core.setPrefix', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'setPrefix');
    this.message = this.chaos.createMessage();

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.member);
  });

  describe('!config core setPrefix', function () {
    beforeEach(function () {
      this.message.content = '!config core setPrefix';
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
          title: "setPrefix",
          description: "Change the prefix for this server.",
          fields: [
            {
              name: "Usage",
              value: `!config core setPrefix <prefix>`,
            },
            {
              name: "Args",
              value: "**prefix**: The new prefix to use for commands.",
            },
          ],
        },
      });
    });
  });

  describe('!config core setPrefix {prefix}', function () {
    beforeEach(function () {
      this.message.content = "!config core setPrefix ?";
    });

    it('responds with a success message', async function () {
      const responses = await this.chaos.testMessage(this.message);
      expect(responses[0]).to.containSubset({
        content: "? is now the command prefix.",
      });
    });

    it('changes the prefix', async function () {
      await this.chaos.testMessage(this.message);
      const commandService = this.chaos.getService('core', 'CommandService');
      expect(commandService.getPrefix(this.message.guild.id)).to.eq('?');
    });
  });
});
