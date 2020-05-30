const Discord = require('discord.js');

const CommandManager = require('./managers/command-manager');
const ConfigManager = require('./managers/config-manager');
const CorePlugin = require('./plugins/core');
const DataManager = require('./managers/data-manager');
const ChaosCore = require('./chaos-core');
const ChaosConfig = require('./models/chaos-config');
const PermissionsManager = require('./managers/permissions-manager');
const PluginManager = require('./managers/plugin-manager');
const ServicesManager = require('./managers/services-manager');
const { ChaosError } = require('./errors');

describe('ChaosCore', function () {
  beforeEach(function () {
    this.config = new ChaosConfig({
      ownerUserId: "mock_ownerUserId",
      loginToken: "mock_loginToken",
      logger: { silent: true },
    });

    this.owner = {
      id: Discord.SnowflakeUtil.generate(),
      send: sinon.fake.resolves(),
    };

    this.discord = {
      destroy: sinon.fake.resolves(),
      login: sinon.fake.resolves(),
      guilds: new Discord.Collection(),
      fetchUser: sinon.stub()
        .withArgs(this.owner.id).resolves(this.owner),
    };

    this.chaos = new ChaosCore(this.config);
    this.chaos.discord = this.discord;
  });

  afterEach(async function () {
    if (this.chaos.listening) {
      await this.chaos.shutdown();
    }
  });

  describe('constructor', function () {
    it('verifies the config', function () {
      sinon.spy(this.config, 'verifyConfig');

      this.chaos = new ChaosCore(this.config);
      expect(this.config.verifyConfig).to.have.been.called;
    });

    it('creates a new Discord client', function () {
      expect(this.chaos.discord).to.be.an.instanceOf(Discord.Client);
    });

    describe('creates and binds managers', function () {
      beforeEach(function () {
        this.chaos = new ChaosCore(this.config);
      });

      it('creates and binds a DataManager', function () {
        expect(this.chaos.dataManager).to.be.an.instanceOf(DataManager);
        expect(this.chaos.setGuildData).to.eq(this.chaos.dataManager.setGuildData);
        expect(this.chaos.getGuildData).to.eq(this.chaos.dataManager.getGuildData);
      });

      it('creates and binds a CommandManager', function () {
        expect(this.chaos.commandManager).to.be.an.instanceOf(CommandManager);
        expect(this.chaos.addCommand).to.eq(this.chaos.commandManager.addCommand);
        expect(this.chaos.getCommand).to.eq(this.chaos.commandManager.getCommand);
      });

      it('creates and binds a ServicesManager', function () {
        expect(this.chaos.servicesManager).to.be.an.instanceOf(ServicesManager);
        expect(this.chaos.addService).to.eq(this.chaos.servicesManager.addService);
        expect(this.chaos.getService).to.eq(this.chaos.servicesManager.getService);
      });

      it('creates and binds a PluginManager', function () {
        expect(this.chaos.pluginManager).to.be.an.instanceOf(PluginManager);
        expect(this.chaos.addPlugin).to.eq(this.chaos.pluginManager.addPlugin);
        expect(this.chaos.getPlugin).to.eq(this.chaos.pluginManager.getPlugin);
      });

      it('creates and binds a ConfigManager', function () {
        expect(this.chaos.configManager).to.be.an.instanceOf(ConfigManager);
        expect(this.chaos.addConfigAction).to.eq(this.chaos.configManager.addConfigAction);
        expect(this.chaos.getConfigAction).to.eq(this.chaos.configManager.getConfigAction);
      });

      it('creates and binds a PermissionsManager', function () {
        expect(this.chaos.permissionsManager).to.be.an.instanceOf(PermissionsManager);
        expect(this.chaos.addPermissionLevel).to.eq(this.chaos.permissionsManager.addPermissionLevel);
        expect(this.chaos.getPermissionLevel).to.eq(this.chaos.permissionsManager.getPermissionLevel);
      });
    });

    it('loads strings from the config', function () {
      this.config.strings = {
        test: () => 'test_string',
      };

      this.chaos = new ChaosCore(this.config);
      expect(this.chaos.strings.test).to.eq(this.config.strings.test);
    });

    it('loads the core plugin', function () {
      this.chaos = new ChaosCore(this.config);
      expect(this.chaos.getPlugin('core')).to.be.an.instanceOf(CorePlugin);
    });

    it('loads plugins from the config', function () {
      this.config.plugins = [{ name: 'testPlugin' }];

      this.chaos = new ChaosCore(this.config);

      const loadedPlugins = this.chaos.pluginManager.plugins;
      expect(loadedPlugins.map((p) => p.name)).to.include('testPlugin');
    });
  });

  describe("#applyStrings", function () {
    it('merges strings into chaos#strings', function () {
      this.chaos.applyStrings({ test: "testing" });
      expect(this.chaos.strings.test).to.equal("testing");
    });
  });

  describe('#listen', function () {
    it('returns an observable', function () {
      expect(this.chaos.listen()).to.be.an.instanceOf(Promise);
    });

    it('emits event in the correct order', async function () {
      const startupHandler = sinon.fake();
      const listenHandler = sinon.fake();
      const readyHandler = sinon.fake();
      const guildCreateHandler = sinon.fake();

      this.chaos.on('chaos.startup', startupHandler);
      this.chaos.on('chaos.listen', listenHandler);
      this.chaos.on('chaos.ready', readyHandler);
      this.chaos.on('guildCreate', guildCreateHandler);

      // create a mock guild to trigger the startup guildCreate event
      this.guild1 = { id: Discord.SnowflakeUtil.generate() };
      this.chaos.discord.guilds.set(this.guild1.id, this.guild1);

      await this.chaos.listen();

      expect(startupHandler).to.have.been.called;
      expect(listenHandler).to.have.been.calledAfter(startupHandler);
      expect(guildCreateHandler).to.have.been.calledAfter(listenHandler);
      expect(readyHandler).to.have.been.calledAfter(guildCreateHandler);
    });

    it('emits when the bot is ready', async function () {
      let emitted = await this.chaos.listen();
      expect(emitted).to.deep.eq('Ready');
    });

    it('replays the ready signal', async function () {
      await this.chaos.listen();
      let emitted = await this.chaos.listen();
      expect(emitted).to.deep.eq('Ready');
    });

    it('does not duplicate the startup process', async function () {
      const startupHandler = sinon.fake();
      this.chaos.on('chaos.startup', startupHandler);

      await this.chaos.listen();
      await this.chaos.listen();

      expect(startupHandler).to.have.been.calledOnce;
    });

    describe('bootstrap process', function () {
      it('logs into discord', async function () {
        this.chaos.discord.login = sinon.fake.resolves(true);
        await this.chaos.listen();
        expect(this.chaos.discord.login).to.have.been.calledWith(this.config.loginToken);
      });

      it('finds the owner', async function () {
        await this.chaos.listen();
        expect(this.chaos.owner).not.to.be.null;
      });

      it('emits an chaos.listen event', async function () {
        const handler = sinon.fake();
        this.chaos.on('chaos.listen', handler);
        await this.chaos.listen();
        expect(handler).to.have.been.calledOnce;
      });

      context('when the bot has joined guilds', function () {
        beforeEach(function () {
          this.guild1 = { id: 'mock_id_1' };
          this.guild2 = { id: 'mock_id_2' };
          this.guild3 = { id: 'mock_id_3' };
          this.chaos.discord.guilds.set(this.guild1.id, this.guild1);
          this.chaos.discord.guilds.set(this.guild2.id, this.guild2);
          this.chaos.discord.guilds.set(this.guild3.id, this.guild3);
        });

        it('emits guildCreate for each', async function () {
          let eventHook = sinon.fake();
          this.chaos.on('guildCreate', eventHook);

          await this.chaos.listen();

          expect(eventHook).to.have.been.calledWith(this.guild1);
          expect(eventHook).to.have.been.calledWith(this.guild2);
          expect(eventHook).to.have.been.calledWith(this.guild3);
        });
      });

      context('when the owner can not be found', function () {
        beforeEach(function () {
          this.error = new Error('Unknown User');
          this.error.name = 'DiscordAPIError';

          this.chaos.discord.fetchUser = sinon.fake.rejects(this.error);
        });

        it('raises an error', async function () {
          try {
            await this.chaos.listen();
          } catch (error) {
            expect(error).to.eq(this.error);
            return;
          }

          throw new Error("No error thrown");
        });
      });
    });
  });

  describe('#shutdown', function () {
    context('when ChaosCore is listening', function () {
      beforeEach(async function () {
        await this.chaos.listen();
      });

      it('stops the main listening stream', async function () {
        await this.chaos.shutdown();
      });

      it('emits a shutdown event', async function () {
        let shutdownHandler = sinon.stub();

        this.chaos.on('chaos.shutdown', shutdownHandler);
        await this.chaos.shutdown();

        expect(shutdownHandler).to.have.been.calledOnce;
      });
    });

    context('when ChaosCore is not listening', function () {
      it('throws an error', async function () {
        try {
          await this.chaos.shutdown();
        } catch (error) {
          expect(error.message).to.eq("Bot is not listening.");
          return;
        }

        throw new Error("No error thrown.");
      });
    });
  });

  describe('#messageOwner', function () {
    beforeEach(function () {
      this.message = "test_message";
      this.chaos.owner = { send: () => {} };
    });

    it('returns an Promise', function () {
      expect(this.chaos.messageOwner(this.message)).to.be.an.instanceOf(Promise);
    });

    context('when the owner has been found', function () {
      beforeEach(function () {
        this.chaos.owner = {
          send: sinon.fake.resolves(''),
        };
      });

      it('sends the message to the owner', async function () {
        await this.chaos.messageOwner(this.message);
        expect(this.chaos.owner.send).to.have.been.calledWith(this.message);
      });

      context('when options are passed as well', function () {
        beforeEach(function () {
          this.options = {};
        });

        it('sends the message and options to the owner', async function () {
          await this.chaos.messageOwner(this.message);
          expect(this.chaos.owner.send).to.have.been.calledWith(this.message, this.options);
        });
      });
    });

    context('when the owner has not been found', function () {
      beforeEach(function () {
        this.chaos.owner = null;
      });

      it('throws an error', async function () {
        try {
          await this.chaos.messageOwner(this.message);
        } catch (error) {
          expect(error).to.be.an.instanceOf(ChaosError);
          expect(error.message).to.eq('Owner was not found.');
          return;
        }

        throw new Error("No error thrown");
      });
    });
  });

  describe('#handleError', function () {
    beforeEach(function () {
      this.error = new Error('mock error');
      this.chaos.owner = { send: () => {} };
    });

    it('returns an Promise', function () {
      expect(this.chaos.handleError(this.error)).to.be.an.instanceOf(Promise);
    });

    it('messages the owner', async function () {
      sinon.stub(this.chaos, 'messageOwner').resolves();
      let embed = this.chaos.createEmbedForError(this.error);

      await this.chaos.handleError(this.error);
      expect(this.chaos.messageOwner).to.have.been.calledOnceWith(
        "I ran into an unhandled exception:", { embed },
      );
    });
  });

  describe('#createEmbedForError', function () {
    beforeEach(function () {
      this.error = new Error('mock error');
    });

    it('returns an RichEmbed', function () {
      expect(this.chaos.createEmbedForError(this.error)).to.be.an.instanceOf(Discord.RichEmbed);
    });

    it('adds an Error field', function () {
      let embed = this.chaos.createEmbedForError(this.error);
      expect(Object.values(embed.fields).map((f) => f.name)).to.include('Error:');
    });

    it('adds an Stack field', function () {
      let embed = this.chaos.createEmbedForError(this.error);
      expect(Object.values(embed.fields).map((f) => f.name)).to.include('Stack:');
    });

    context('when extra fields are passed', function () {
      beforeEach(function () {
        this.extraFields = [
          { name: 'test1', value: 'value1' },
          { name: 'test2', value: 'value2' },
          { name: 'test3', value: 'value3' },
        ];
      });

      it('adds the extra fields', function () {
        let embed = this.chaos.createEmbedForError(this.error, this.extraFields);
        let fields = Object.values(embed.fields);

        this.extraFields.forEach((extraField) => {
          expect(fields.map((f) => f.name)).to.include(extraField.name);
        });
      });
    });
  });
});
