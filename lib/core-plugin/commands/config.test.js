const createChaosStub = require('../../test/create-chaos-stub');

describe('Command: !config', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.command = this.chaos.getCommand('config');

    this.message = this.chaos.createMessage({
      content: '!config',
    });

    this.chaos.addPlugin({
      name: "test",
      configActions: [
        { name: "action1" },
        { name: "action2" },
        { name: "action3" },
      ],
    });

    await this.chaos.listen();
  });

  context('when the user is not an admin', function () {
    it('does not run the command', async function () {
      sinon.spy(this.command, 'run');

      let responses = await this.chaos.testMessage(this.message);

      expect(this.command.run).not.to.have.been.called;
      expect(responses).to.have.length(0);
    });
  });

  context('when the user is an admin', function () {
    beforeEach(async function () {
      await this.chaos.getService('core', 'PermissionsService')
        .addUser(this.message.guild, 'admin', this.message.author);
    });

    describe('!config', function () {
      it('replies with the command usage', async function () {
        let responses = await this.chaos.testMessage(this.message);

        expect(responses).to.have.length(1);
        expect(responses[0]).to.containSubset({
          content: "I'm sorry, but I'm missing some information for that command:",
          embed: {
            fields: [
              {
                "name": "Usage",
                "value": "!config [--list] <plugin> <action>",
              },
            ],
          },
        });
      });
    });

    describe('!config --list', function () {
      beforeEach(function () {
        this.message.content = '!config --list';
      });

      it('replies with a list of available config actions in all plugins', async function () {
        const coreActions = this.chaos.configManager.actions
          .filter((action) => action.pluginName === "core")
          .map((action) => action.name);

        let responses = await this.chaos.testMessage(this.message);

        expect(responses).to.have.length(1);
        expect(responses[0]).to.containSubset({
          content: "Here's a list of plugins with config actions:",
          embed: {
            fields: [
              { name: "core", value: coreActions.join(', ') },
              { name: "test", value: 'action1, action2, action3' },
            ],
          },
        });
      });
    });

    describe('!config {plugin}', function () {
      beforeEach(function () {
        this.message.content = '!config test';
      });

      it('replies with the command usage', async function () {
        let responses = await this.chaos.testMessage(this.message);

        expect(responses).to.have.length(1);
        expect(responses[0]).to.containSubset({
          content: "I'm sorry, but I'm missing some information for that command:",
          embed: {
            fields: [
              { name: "Usage", value: "!config [--list] <plugin> <action>" },
            ],
          },
        });
      });
    });

    describe('!config {plugin} --list', function () {
      beforeEach(function () {
        this.message.content = '!config test --list';
      });

      it('lists config actions in the plugin', async function () {
        let responses = await this.chaos.testMessage(this.message);

        expect(responses).to.have.length(1);
        expect(responses[0]).to.containSubset({
          content: "Here's a list of config actions for test:",
          embed: {
            "fields": [
              { name: "action1", value: "*Usage*:\n\t!config test action1" },
              { name: "action2", value: "*Usage*:\n\t!config test action2" },
              { name: "action3", value: "*Usage*:\n\t!config test action3" },
            ],
          },
        });
      });

      it('does not list actions from other plugins', async function () {
        const configActions = Object.values(this.chaos.configManager.actions)
          .filter((action) => action.pluginName !== 'test');

        let responses = await this.chaos.testMessage(this.message);
        expect(responses[0]).not.to.containSubset({
          embed: {
            fields: configActions.map((action) => ({ name: action.name })),
          },
        });
      });
    });

    describe('!config {plugin} {action}', function () {
      beforeEach(function () {
        this.action = this.chaos.getConfigAction('test', 'action1');
        this.message.content = '!config test action1';
      });

      context('when the plugin is disabled', function () {
        it('gives an error message', async function () {
          sinon.spy(this.action, 'run');

          let responses = await this.chaos.testMessage(this.message);

          expect(this.action.run).not.to.have.been.called;
          expect(responses).to.have.length(1);
          expect(responses[0]).to.containSubset({
            content:
              "The plugin \"test\" is currently disabled.\n" +
              "You can use `!config core enablePlugin test` to enable it.",
          });
        });
      });

      context('when the plugin is enabled', function () {
        beforeEach(async function () {
          await this.chaos.getService('core', 'PluginService')
            .enablePlugin(this.message.guild.id, 'test');
        });

        it('runs a config action', async function () {
          sinon.spy(this.action, 'run');

          let responses = await this.chaos.testMessage(this.message);

          expect(this.action.run).to.have.been.called;
          expect(responses).to.have.length(0);
        });
      });
    });
  });
});
