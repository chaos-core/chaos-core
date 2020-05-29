const Discord = require('discord.js');

const ChaosComponent = require("./chaos-component");
const createChaosStub = require('../test/create-chaos-stub');

describe('ChaosComponent', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.component = new ChaosComponent(this.chaos);
  });

  describe('#chaos', function () {
    it("returns the bound chaos bot", function () {
      expect(this.component.chaos).to.eq(this.chaos);
    });
  });

  describe('#logger', function () {
    it("returns the chaos bot's logger", function () {
      expect(this.component.logger).to.eq(this.chaos.logger);
    });
  });

  describe('#strings', function () {
    it("returns the chaos bot's loaded strings", function () {
      expect(this.component.strings).to.eq(this.chaos.strings);
    });
  });

  describe('#isPluginEnabled', function () {
    beforeEach(function () {
      this.guild = { id: Discord.SnowflakeUtil.generate() };
      this.plugin = { name: "test" };
      this.chaos.addPlugin(this.plugin);
    });

    it("returns false if the component hasn't been bound to a plugin", async function () {
      expect(await this.component.isPluginEnabled(this.guild)).to.eq(false);
    });

    it("returns false if the plugin is not enabled", async function () {
      this.component.pluginName = "test";
      expect(await this.component.isPluginEnabled(this.guild)).to.eq(false);
    });

    it("returns true if the plugin is enabled", async function () {
      this.component.pluginName = "test";
      await this.chaos.getService("core", "PluginService")
        .enablePlugin(this.guild.id, "test");
      expect(await this.component.isPluginEnabled(this.guild)).to.eq(true);
    });
  });

  describe('#getGuildData', function () {
    beforeEach(function () {
      this.guild = { id: Discord.SnowflakeUtil.generate() };
      this.key = "test-data";
    });

    it("returns saved data", async function () {
      await this.chaos.setGuildData(this.guild.id, this.key, "example");
      expect(await this.component.getGuildData(this.guild.id, this.key))
        .to.eq("example");
    });

    it("returns undefined if no data was saved", async function () {
      expect(await this.component.getGuildData(this.guild.id, this.key))
        .to.be.undefined;
    });
  });

  describe('#setGuildData', function () {
    beforeEach(function () {
      this.guild = { id: Discord.SnowflakeUtil.generate() };
      this.key = "test-data";
    });

    it("saves data to the data source", async function () {
      await this.component.setGuildData(this.guild.id, this.key, "example");
      expect(await this.chaos.getGuildData(this.guild.id, this.key))
        .to.eq("example");
    });
  });

  describe('#getUserData', function () {
    beforeEach(function () {
      this.user = { id: Discord.SnowflakeUtil.generate() };
      this.key = "test-data";
    });

    it("returns saved data", async function () {
      await this.chaos.setUserData(this.user.id, this.key, "example");
      expect(await this.component.getUserData(this.user.id, this.key))
        .to.eq("example");
    });

    it("returns undefined if no data was saved", async function () {
      expect(await this.component.getUserData(this.user.id, this.key))
        .to.be.undefined;
    });
  });

  describe('#setUserData', function () {
    beforeEach(function () {
      this.user = { id: Discord.SnowflakeUtil.generate() };
      this.key = "test-data";
    });

    it("saves data to the data source", async function () {
      await this.component.setUserData(this.user.id, this.key, "example");
      expect(await this.chaos.getUserData(this.user.id, this.key))
        .to.eq("example");
    });
  });

  describe('#getService', function () {
    it("loads a service from the bot", async function () {
      const pluginService = this.chaos.getService("core", "PluginService");
      expect(await this.component.getService("core", "PluginService"))
        .to.eq(pluginService);
    });
  });

  describe('#validate', function () {
    it("returns true", async function () {
      expect(await this.component.validate()).to.eq(true);
    });
  });
});
