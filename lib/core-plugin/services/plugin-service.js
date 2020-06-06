const DataKeys = require('../datakeys');
const Service = require('../../models/service');
const { PluginError } = require("../../errors");
const { asPromise } = require("../../utility");

class PluginService extends Service {
  constructor(chaos) {
    super(chaos);

    this.getPlugin = this.chaos.pluginManager.getPlugin;

    this.chaos.on('guildCreate', async (guild) => {
      return Promise.all(this.plugins.map(async (plugin) => {
        const enabled = await this.isPluginEnabled(guild.id, plugin.name);
        if (enabled) {
          await this._hookOnEnabled(guild.id, plugin);
        }
      }));
    });
  }

  get plugins() {
    return this.chaos.pluginManager.plugins;
  }

  async enablePlugin(guildId, pluginName) {
    let plugin = this.getPlugin(pluginName);

    this.chaos.logger.info(`[${guildId}] Enabling plugin ${pluginName}`);
    const savedData = await this._getEnabledPlugins(guildId);
    savedData[plugin.name] = true;

    return this._setEnabledPlugins(guildId, savedData)
      .then(() => this._hookOnEnabled(guildId, plugin));
  }

  async disablePlugin(guildId, pluginName) {
    let plugin = this.getPlugin(pluginName);

    if (plugin.name === "core") {
      throw new PluginError("Core plugin can't be disabled.");
    }

    this.chaos.logger.info(`[${guildId}] Disabling plugin ${pluginName}`);
    const savedData = await this._getEnabledPlugins(guildId);
    savedData[plugin.name] = false;

    return this._setEnabledPlugins(guildId, savedData)
      .then(() => this._hookOnDisabled(guildId, plugin));
  }

  async isPluginEnabled(guildId, pluginName) {
    let plugin = this.chaos.getPlugin(pluginName);

    if (plugin.name === "core") {
      return true; // Core plugin is always enabled
    }

    const savedData = await this._getEnabledPlugins(guildId);
    return Boolean(savedData[plugin.name]);
  }

  async _getEnabledPlugins(guildId) {
    let data = await this.getGuildData(guildId, DataKeys.ENABLED_PLUGINS);
    return data ? data : {};
  }

  async _setEnabledPlugins(guildId, enabledPlugins) {
    await this.setGuildData(guildId, DataKeys.ENABLED_PLUGINS, enabledPlugins);
    return this._getEnabledPlugins(guildId);
  }

  async _hookOnEnabled(guildId, plugin) {
    if (plugin.onEnabled) {
      const guild = this.chaos.discord.guilds.get(guildId);
      await asPromise(plugin.onEnabled(guild));
    }
  }

  async _hookOnDisabled(guildId, plugin) {
    if (plugin.onDisabled) {
      const guild = this.chaos.discord.guilds.get(guildId);
      return asPromise(plugin.onDisabled(guild));
    }
  }
}

module.exports = PluginService;
