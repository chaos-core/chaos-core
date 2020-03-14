const { from, of } = require('rxjs');
const { flatMap, toArray, mapTo, filter, tap } = require('rxjs/operators');

const ChaosManager = require('../models/chaos-manager');
const Plugin = require('../models/plugin');
const { LoadPluginError } = require("../errors/plugin-manager-errors");
const { toObservable } = require("../utility");

class PluginManager extends ChaosManager {
  constructor(chaos) {
    super(chaos);
    this._plugins = {};

    //Bind methods for aliasing to ChaosCore
    this.addPlugin = this.addPlugin.bind(this);
    this.getPlugin = this.getPlugin.bind(this);

    this.chaos.on('guildCreate', (guild) => this.onGuildCreate(guild));
    this.chaos.on('chaos.listen', () => this.onChaosListen());
  }

  get plugins() {
    // replace the keys with the case sensitive names
    return Object.values(this._plugins);
  }

  getPlugin(pluginName) {
    let plugin = this._plugins[pluginName.toLowerCase()];

    if (!plugin) {
      let error = new Error(`Plugin '${pluginName}' could not be found. Has it been added to the bot?`);
      error.name = "PluginNotFoundError";
      throw error;
    }

    return plugin;
  }

  addPlugin(plugin) {
    if (typeof plugin === "string") {
      const npmPackageName = `chaos-plugin-${plugin}`;

      try {
        plugin = require(npmPackageName);
      } catch (error) {
        if (error.code === "MODULE_NOT_FOUND") {
          throw new LoadPluginError(`Unable to load plugin '${npmPackageName}'. Is the npm module '${npmPackageName}' installed?`);
        } else {
          throw error;
        }
      }
    }

    if (plugin instanceof Plugin) {
      if (plugin.chaos !== this.chaos) {
        throw TypeError("Plugin is bound to a different instance of ChaosCore.");
      }
    } else if (plugin.prototype instanceof Plugin) {
      plugin = new plugin(this.chaos);
    } else {
      plugin = new Plugin(this.chaos, plugin);
    }

    plugin.validate();

    if (this._plugins[plugin.name.toLowerCase()]) {
      let error = new Error(`Plugin '${plugin.name}' has already been added.`);
      error.name = "PluginAlreadyExistsError";
      throw error;
    }

    plugin.dependencies.forEach((plugin) => this.addPlugin(plugin));

    this.chaos.logger.verbose(`Loading plugin: ${plugin.name}`);
    this._plugins[plugin.name.toLowerCase()] = plugin;

    plugin.services.forEach((Service) => {
      this.chaos.addService(plugin.name, Service);
    });

    plugin.configActions.forEach((action) => {
      this.chaos.addConfigAction(plugin.name, action);
    });

    plugin.commands.forEach((command) => {
      this.chaos.addCommand(plugin.name, command);
    });

    plugin.permissions.forEach((level) => {
      this.chaos.addPermissionLevel(level);
    });

    this.chaos.logger.info(`Loaded plugin: ${plugin.name}`);
  }

  onChaosListen() {
    this.pluginService = this.chaos.getService('core', 'PluginService');

    return of('').pipe(
      flatMap(() => from(this.plugins).pipe(
        filter((plugin) => plugin.onListen),
        tap((plugin) => this.chaos.logger.warn(
          `plugin ${plugin.name}.onListen is deprecated. ` +
          `Please use chaos.on("chaos.listen", () => {}) instead`,
        )),
        flatMap((plugin) => toObservable(plugin.onListen())),
        toArray(),
      )),
      flatMap(() => from(this.plugins).pipe(
        filter((plugin) => plugin.onEnabled),
        tap((plugin) => this.chaos.logger.warn(
          `plugin ${plugin.name}.onEnabled is deprecated.`,
        )),
        flatMap((plugin) => from(this.chaos.discord.guilds.array()).pipe(
          flatMap((guild) => this.pluginService.isPluginEnabled(guild.id, plugin.name).pipe(
            filter(Boolean),
            mapTo([plugin, guild]),
          )),
        )),
        flatMap(([plugin, guild]) => toObservable(plugin.onEnabled(guild))),
        toArray(),
      )),
      mapTo(true),
    );
  }

  onGuildCreate(guild) {
    return of('').pipe(
      flatMap(() => from(this.plugins).pipe(
        this._prepareDataForGuild(guild),
      )),
      flatMap(() => from(this.plugins).pipe(
        filter((plugin) => plugin.prepareData),
        tap((plugin) => this.chaos.logger.warn(
          `plugin ${plugin.name}.prepareData is deprecated. ` +
          `Please use chaos.on("guildCreate:before", () => {}) instead`,
        )),
        flatMap((plugin) => toObservable(plugin.prepareData(guild))),
        toArray(),
      )),
      flatMap(() => from(this.plugins).pipe(
        filter((plugin) => plugin.onJoinGuild),
        tap((plugin) => this.chaos.logger.warn(
          `plugin ${plugin.name}.onJoinGuild is deprecated. ` +
          `Please use chaos.on("guildCreate", () => {}) instead`,
        )),
        flatMap((plugin) => toObservable(plugin.onJoinGuild(guild))),
        toArray(),
      )),
      mapTo(true),
    );
  }

  _prepareDataForGuild(guild) {
    return flatMap((plugin) => from(plugin.defaultData).pipe(
      flatMap((defaultData) => this.chaos.getGuildData(guild.id, defaultData.keyword).pipe(
        filter((savedData) => typeof savedData === 'undefined'),
        flatMap(() => this.chaos.setGuildData(guild.id, defaultData.keyword, defaultData.data)),
      )),
    ));
  }
}

module.exports = PluginManager;