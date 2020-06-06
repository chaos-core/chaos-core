const createChaosStub = require('../../test/create-chaos-stub');

describe('Command: !help', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.command = this.chaos.getCommand('help');
    this.message = this.chaos.createMessage();

    this.chaos.addPlugin({
      name: "test",
      commands: [
        { name: "command1", description: "Test command 1", run: () => {} },
        { name: "command2", description: "Test command 2", run: () => {} },
        { name: "command3", description: "Test command 3", run: () => {} },
      ],
    });

    await this.chaos.listen();
    await this.chaos.getService('core', 'PluginService')
      .enablePlugin(this.message.guild.id, 'test');
  });

  afterEach(async function () {
    if (this.chaos.listening) {
      await this.chaos.shutdown();
    }
  });

  describe('!help', function () {
    beforeEach(function () {
      this.message.content = '!help';
    });

    it('sends two responses', async function () {
      let responses = await this.chaos.testMessage(this.message);
      expect(responses).to.have.length(2);
      expect(responses[0].type).to.eq("dm");
      expect(responses[1].type).to.eq("message");
      expect(responses[1].content).to.eq("Check your DMs for the command list.");
    });

    it('shows commands that the user can run', async function () {
      let responses = await this.chaos.testMessage(this.message);
      const helpList = responses[0];
      expect(helpList.content).to.contain(
        "Here's everything that I can do for you.\n" +
        "If you want more help on a specific command, add '--help' to the command",
      );

      expect(helpList.content).to.contain(
        "**core**\n" +
        "> !help\n" +
        ">    *See all commands that I can do*",
      );

      expect(helpList.content).to.contain(
        "**test**\n" +
        "> !command1\n" +
        ">    *Test command 1*\n" +
        "> !command2\n" +
        ">    *Test command 2*\n" +
        "> !command3\n" +
        ">    *Test command 3*",
      );
    });

    context('when plugins are disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'PluginService')
          .disablePlugin(this.message.guild.id, 'test');
      });

      it('hides commands from plugins that are disabled', async function () {
        let responses = await this.chaos.testMessage(this.message);

        const helpList = responses[0];
        expect(helpList.content).to.contain(
          "Here's everything that I can do for you.\n" +
          "If you want more help on a specific command, add '--help' to the command",
        );

        expect(helpList.content).to.contain(
          "**core**\n" +
          "> !help\n" +
          ">    *See all commands that I can do*",
        );

        expect(helpList.content).not.to.contain(
          "**test**\n" +
          "> !command1\n" +
          ">    *Test command 1*\n" +
          "> !command2\n" +
          ">    *Test command 2*\n" +
          "> !command3\n" +
          ">    *Test command 3*",
        );
      });
    });

    context('when commands are explicitly disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'CommandService')
          .disableCommand(this.message.guild.id, 'command2');
      });

      it('hides commands that are disabled', async function () {
        let responses = await this.chaos.testMessage(this.message);

        const helpList = responses[0];
        expect(helpList.content).not.to.contain(
          "> !command2\n" +
          ">    *Test command 2*",
        );
      });
    });

    context('when the user has permission to run a command', function () {
      beforeEach(async function () {
        this.chaos.addCommand('test', {
          name: "adminCommand1",
          description: "Test admin command 3",
          permissions: ["admin"],
          run: () => {},
        });

        await this.chaos.getService('core', 'PermissionsService')
          .addUser(this.message.guild, 'admin', this.message.author);
      });

      it('lists commands that the user can run', async function () {
        let responses = await this.chaos.testMessage(this.message);
        const helpList = responses[0];

        expect(helpList.content).to.contain(
          "Here's everything that I can do for you.\n" +
          "If you want more help on a specific command, add '--help' to the command",
        );

        expect(helpList.content).to.contain(
          "> !config\n" +
          ">    *Edit or view settings for this guild*",
        );

        expect(helpList.content).to.contain(
          "> !adminCommand1\n" +
          ">    *Test admin command 3*",
        );
      });
    });
  });
});
