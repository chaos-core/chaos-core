const Discord = require('discord.js');
const deepmerge = require("deepmerge");

const ChaosConfig = require("./models/chaos-config");
const ChaosLogger = require("./chaos-logger");
const DataManager = require('./managers/data-manager');
const CommandManager = require('./managers/command-manager');
const ServicesManager = require('./managers/services-manager');
const PluginManager = require('./managers/plugin-manager');
const ConfigManager = require('./managers/config-manager');
const PermissionsManager = require('./managers/permissions-manager');
const EventManager = require('./managers/event-manager');
const { ChaosError } = require('./errors');
const defaultStrings = require('./strings');

const packageJson = require('../package.json');

class ChaosCore {
  strings = { ...defaultStrings };
  discord = null;
  owner = null;

  /**
   * Create a new instance of ChaosCore
   * @param config {ChaosConfig} configuration settings for this ChaosCore bot
   */
  constructor(config) {
    if (!(config instanceof ChaosConfig)) { config = new ChaosConfig(config); }

    this.config = config;
    this.config.verifyConfig(); // Confirm the config is valid

    this.logger = ChaosLogger.createLogger(this.config.logger);
    this.strings = { ...defaultStrings };

    this.discord = new Discord.Client(this.config.discord);

    this._initializeManagers();
    this._loadPlugins();

    this.applyStrings(this.config.strings);

    this.on('chaos.ready', () => {
      const statsString = this._statsString();
      this.logger.info(`Ready!`);
      this.logger.info(statsString);
      if (this.config.messageOwnerOnBoot) {
        this.messageOwner(`I'm now online:\n\`\`\`${statsString}\`\`\``);
      }
    });
  }

  _listening = false;

  /**
   * Checks if ChaosCore is listening to Discord
   * @returns {boolean}
   */
  get listening() {
    return this._listening;
  }

  applyStrings(strings) {
    this.strings = deepmerge(this.strings, strings || {});
  }

  _initializeManagers() {
    this.eventManager = new EventManager(this);
    this.registerEvent = this.eventManager.registerEvent;
    this.on = this.eventManager.on;
    this.emit = this.eventManager.emit;

    this.dataManager = new DataManager(this);
    this.setGuildData = this.dataManager.setGuildData;
    this.getGuildData = this.dataManager.getGuildData;
    this.setUserData = this.dataManager.setUserData;
    this.getUserData = this.dataManager.getUserData;

    this.pluginManager = new PluginManager(this);
    this.addPlugin = this.pluginManager.addPlugin;
    this.getPlugin = this.pluginManager.getPlugin;

    this.commandManager = new CommandManager(this);
    this.addCommand = this.commandManager.addCommand;
    this.getCommand = this.commandManager.getCommand;

    this.servicesManager = new ServicesManager(this);
    this.addService = this.servicesManager.addService;
    this.getService = this.servicesManager.getService;

    this.configManager = new ConfigManager(this);
    this.addConfigAction = this.configManager.addConfigAction;
    this.getConfigAction = this.configManager.getConfigAction;

    this.permissionsManager = new PermissionsManager(this);
    this.addPermissionLevel = this.permissionsManager.addPermissionLevel;
    this.getPermissionLevel = this.permissionsManager.getPermissionLevel;
  }

  _loadPlugins() {
    this.addPlugin(require("./core-plugin"));

    if (this.config.web.enabled) {
      this.addPlugin(require("./web-api-plugin"));
    }

    this.config.plugins.forEach((plugin) => this.addPlugin(plugin));
  }

  /**
   * Start the discord bot
   *
   * @return {Promise<string>} Resolves "ready" when ready to listen
   */
  async listen() {
    if (!this.listening) {
      this._listening = true;

      this.logger.info(`=== Starting ChaosCore ===`);
      await this.emit('chaos.startup');
      this.logger.verbose(`Completed chaos.listen event`);

      this.logger.verbose(`Logging into Discord`);
      await this.discord.login(this.config.loginToken);
      this.logger.info(`Logged into Discord. In ${this.discord.guilds.size} guilds`);

      this.logger.verbose(`Finding owner`);
      this.owner = await this.discord.fetchUser(this.config.ownerUserId);
      this.logger.info(`Found owner ${this.owner.tag}`);

      this.logger.verbose(`Starting chaos.listen event`);
      await this.emit('chaos.listen');
      this.logger.verbose(`Completed chaos.listen event`);

      this.logger.verbose(`Running startup guildCreate events`);
      for (const guild of this.discord.guilds.array()) {
        await this.emit('guildCreate', guild);
      }
      this.logger.verbose(`Completed startup guildCreate events`);

      this.logger.info(`=== Ready ===`);
      await this.emit('chaos.ready');
    }

    return 'Ready';
  }

  /**
   * Triggers a soft shutdown of the bot.
   */
  async shutdown() {
    if (!this.listening) { throw new ChaosError("Bot is not listening."); }
    this.logger.info('Shutdown signal received.');

    this.logger.verbose(`Starting chaos.shutdown event`);
    await this.emit('chaos.shutdown');
    this.logger.verbose(`Completed chaos.shutdown event`);

    this.logger.info(`Closing Discord connection`);
    await this.discord.destroy();
    this._listening = false;
  }

  /**
   * Sends a message to the owner of the bot
   *
   * @param message
   * @param options
   *
   * @return {Promise<Message>} The sent message to Discord
   */
  async messageOwner(message, options = {}) {
    if (this.owner === null) {
      throw new ChaosError('Owner was not found.');
    } else {
      return this.owner.send(message, options);
    }
  }

  /**
   * Notifies the owner of the error, with the additional fields
   *
   * @param error {Error} the error that was raised
   * @param embedFields {Array<{name: string, value: string}>}
   *    additional data for the message to the owner
   */
  async handleError(error, embedFields) {
    if (error.stack) {
      this.logger.error(error.stack.toString());
      const embed = this.createEmbedForError(error, embedFields);
      const ownerMsg = this.strings.commandRun.unhandledException.forOwner({});
      await this.messageOwner(ownerMsg, { embed });
    } else {
      this.logger.error(error);
    }
  }

  /**
   * Builds a embed for the error with additional fields if needed
   *
   * @param error {Error} The error to build an embed for
   * @param extraFields {Array} List of additional fields to add to the embed
   * @returns {RichEmbed}
   */
  createEmbedForError(error, extraFields = []) {
    let embed = new Discord.RichEmbed();

    embed.addField("Error:", `${error.name}: ${error.message}`);
    extraFields.forEach((field) => {
      embed.addField(field.name, field.value);
    });
    embed.addField('Stack:', this._getStackForEmbed(error));

    return embed;
  }

  _statsString() {
    let dataSource = this.dataManager.type;
    let guilds = this.discord.guilds;
    let plugins = this.pluginManager.plugins;

    return [
      '=== System Stats: ===',
      `Chaos-Core Version: ${packageJson.version}`,
      `Data source: ${dataSource}`,
      `Guilds: ${guilds.size}`,
      `Plugins: ${plugins.length}`,
      plugins.map((m) => '\t' + m.name).join('\n'),
    ].join('\n');
  }

  _getStackForEmbed(error) {
    let stack = error.stack.split('\n');
    let stackString = '';
    let nextLine = stack.shift();

    while (nextLine && (`${stackString}\n${nextLine}\n...`).length < 1000) { // max length of 1000-ish characters
      stackString += '\n' + nextLine;
      nextLine = stack.shift();
    }

    if (stack.length >= 1) {
      stackString += '\n...';
    }

    return stackString;
  }
}

module.exports = ChaosCore;
