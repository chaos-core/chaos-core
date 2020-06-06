const createChaosStub = require('../../../test/create-chaos-stub');

describe('Config: core.listCmds', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.action = this.chaos.getConfigAction('core', 'listCmds');
    this.message = this.chaos.createMessage();

    this.chaos.addPlugin({
      name: "test",
      commands: [
        { name: "command1" },
        { name: "command2" },
        { name: "command3" },
      ],
    });

    await this.chaos.listen();
    await this.chaos.getService('core', 'PermissionsService')
      .addUser(this.message.guild, 'admin', this.message.member);
    await this.chaos.getService('core', 'PluginService')
      .enablePlugin(this.message.guild.id, 'test');
  });

  afterEach(async function () {
    if (this.chaos.listening) {
      await this.chaos.shutdown();
    }
  });

  describe('!config core listCmds', function () {
    beforeEach(function () {
      this.message.content = '!config core listCmds';
    });

    it('runs the action', async function () {
      sinon.spy(this.action, 'run');
      await this.chaos.testMessage(this.message);
      expect(this.action.run).to.have.been.called;
    });

    it('lists all available commands', async function () {
      sinon.spy(this.action, 'run');
      let responses = await this.chaos.testMessage(this.message);
      expect(this.action.run).to.have.been.called;
      expect(responses[0]).to.containSubset({
        content: "Here are all my available commands:",
        embed: {
          fields: [
            {
              name: "Enabled Commands:",
              value: [
                "**== core ==**",
                "`owner:shutdown`",
                "- Shutdown",
                "`owner:listGuilds`",
                "- list all servers the bot is connected to",
                "`config`",
                "- Edit or view settings for this guild",
                "`help`",
                "- See all commands that I can do",
                "**== test ==**",
                "`command1`",
                "- null",
                "`command2`",
                "- null",
                "`command3`",
                "- null",
              ].join("\n"),
            },
          ],
        },
      });
    });

    context('when a plugin is disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'PluginService')
          .disablePlugin(this.message.guild.id, 'test');
      });

      it("lists the commands as disabled", async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "Here are all my available commands:",
          embed: {
            fields: [
              {
                name: "Enabled Commands:",
                value: [
                  "**== core ==**",
                  "`owner:shutdown`",
                  "- Shutdown",
                  "`owner:listGuilds`",
                  "- list all servers the bot is connected to",
                  "`config`",
                  "- Edit or view settings for this guild",
                  "`help`",
                  "- See all commands that I can do",
                ].join("\n"),
              },
              {
                name: "Disabled Commands:",
                value: [
                  "**== test ==**",
                  "`command1` - plugin 'test' disabled",
                  "- null",
                  "`command2` - plugin 'test' disabled",
                  "- null",
                  "`command3` - plugin 'test' disabled",
                  "- null",
                ].join("\n"),
              },
            ],
          },
        });
      });
    });

    context('when a command is explicitly disabled', function () {
      beforeEach(async function () {
        await this.chaos.getService('core', 'CommandService')
          .disableCommand(this.message.guild.id, 'command2');
      });

      it("lists the commands as disabled", async function () {
        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).to.containSubset({
          content: "Here are all my available commands:",
          embed: {
            fields: [
              {
                name: "Enabled Commands:",
                value: [
                  "**== core ==**",
                  "`owner:shutdown`",
                  "- Shutdown",
                  "`owner:listGuilds`",
                  "- list all servers the bot is connected to",
                  "`config`",
                  "- Edit or view settings for this guild",
                  "`help`",
                  "- See all commands that I can do",
                  "**== test ==**",
                  "`command1`",
                  "- null",
                  "`command3`",
                  "- null",
                ].join("\n"),
              },
              {
                name: "Disabled Commands:",
                value: [
                  "**== test ==**",
                  "`command2` - explicitly disabled",
                  "- null",
                ].join("\n"),
              },
            ],
          },
        });
      });
    });
  });
});
