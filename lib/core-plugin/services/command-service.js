const Discord = require('discord.js');

const Service = require('../../models/service');
const Response = require('../../models/response');
const CommandParser = require('../../command-parser');
const DataKeys = require("../datakeys");
const { ReqCommandError } = require("../../errors");
const {
  EnableCommandError, DisableCommandError, PluginDisabledError,
} = require("../../errors");
const { asPromise } = require("../../utility");

const REQUIRED_COMMANDS = ['help', 'config'];

class CommandService extends Service {
  constructor(chaos) {
    super(chaos);

    this.defaultPrefix = '!';
    this.prefixes = {};

    if (this.chaos.config.defaultPrefix) {
      this.defaultPrefix = this.chaos.config.defaultPrefix;
    }

    this.chaos.registerEvent('chaos.command');
    this.chaos.registerEvent('chaos.response');

    this.chaos.on('chaos.listen', () => {
      this.permissionsService = this.getService('core', 'permissionsService');
      this.pluginService = this.getService('core', 'pluginService');
    });

    this.chaos.on('guildCreate', async (guild) => {
      this.prefixes[guild.id] = await this.getGuildData(guild.id, 'core.commandPrefix');
      this.chaos.logger.verbose(`Loaded prefix ${this.prefixes[guild.id]} for guild ${guild.name}`);
    });

    this.chaos.on('message', async (message) => {
      if (message.channel.type === 'text' && this.msgIsCommand(message)) {
        await this.chaos.emit('chaos.command', message);
      }
    });

    this.chaos.on('chaos.command', async (message) => {
      try {
        await this.runCommandForMsg(message);
      } catch (error) {
        await this.chaos.handleError(error, [
          { name: "Message:", value: message.toString() },
        ]);
      }
    });
  }

  msgIsCommand(message) {
    let prefixes = this.getPrefixesForMessage(message);
    if (!CommandParser.isCommand(message, prefixes)) {
      return false;
    }

    let commandName = CommandParser.getCommandName(message, prefixes);

    try {
      this.chaos.getCommand(commandName);
      return true;
    } catch (error) {
      if (error.name === "CommandNotFoundError") {
        return false;
      } else {
        throw error;
      }
    }
  }

  async runCommandForMsg(message) {
    this.chaos.logger.info(`[${message.guild.name}] ==> Running command ${message.content}`);

    let prefixes = this.getPrefixesForMessage(message);
    let context = CommandParser.parse(this.chaos, message, prefixes);
    let response = new Response(message);

    try {
      if (await this.canRunCommand(context)) {
        await asPromise(context.command.execCommand(context, response));
      }
    } catch (error) {
      await this.handleCmdError(error, context, response);
    }

    await this.chaos.emit('chaos.response', response);
    this.chaos.logger.info(`[${message.guild.name}] <== Completed command ${message.content}`);
  }

  async handleCmdError(error, context, response) {
    await Promise.all([
      response.send({
        type: 'message',
        content: this.chaos.strings.commandRun.unhandledException.forUser({
          owner: this.chaos.owner,
        }),
      }),
      this.chaos.handleError(error, [
        { name: "Guild", value: context.guild.name },
        { name: "Channel", value: context.channel.name },
        { name: "Author", value: context.author.tag },
      ]),
    ]);
  }

  async enableCommand(guildId, commandName) {
    let command = this.chaos.getCommand(commandName);

    let enabledCmds = await this._getEnabledCommands(guildId);
    if (enabledCmds[command.name] !== false) {
      throw new EnableCommandError(`${command.name} is already enabled.`);
    }

    this.chaos.logger.info(`[${guildId}] Enabling command ${command.name}`);
    enabledCmds[command.name] = true;
    return this._setEnabledCommands(guildId, enabledCmds)
      .then((enabledCmds) => enabledCmds[command.name]);
  }

  async disableCommand(guildId, commandName) {
    let command = this.chaos.getCommand(commandName);

    // required commands must always be enabled
    if (REQUIRED_COMMANDS.includes(command.name)) {
      throw new ReqCommandError(`Command ${commandName} is required and can not be disabled.`);
    }

    this.chaos.logger.info(`[${guildId}] Disabling command ${command.name}`);
    let enabledCmds = await this._getEnabledCommands(guildId);
    if (enabledCmds[command.name] === false) {
      throw new DisableCommandError(`${command.name} was already disabled.`);
    }

    enabledCmds[command.name] = false;
    return this._setEnabledCommands(guildId, enabledCmds)
      .then((enabledCmds) => enabledCmds[command.name]);
  }

  /**
   * Determine the valid prefixes for the given message
   *
   * @param message
   *
   * @return {String[]}
   */
  getPrefixesForMessage(message) {
    let userId = this.chaos.discord.user.id;

    return [
      this.getPrefixForChannel(message.channel),
      `<@${userId}> `,
      `<@!${userId}> `,
    ];
  }

  getPrefix(guildId) {
    let prefix = this.prefixes[guildId];
    if (typeof prefix === 'undefined') {
      prefix = this.defaultPrefix;
    }
    return prefix;
  }

  getPrefixForChannel(channel) {
    if (channel.type === 'text') {
      return this.getPrefix(channel.guild.id);
    } else {
      return this.defaultPrefix;
    }
  }

  async setPrefix(guild, prefix) {
    this.chaos.logger.info(`[${guild.name}] Setting prefix to ${prefix}`);
    let newPrefix = await this.setGuildData(guild.id, 'core.commandPrefix', prefix);
    this.prefixes[guild.id] = newPrefix;
    return newPrefix;
  }

  async canRunCommand(context) {
    try {
      const checks = await Promise.all([
        this.canSendMessage(context.channel),
        this.isCommandEnabled(context.guild.id, context.command.name),
        this.permissionsService.hasPermission(context, context.command.name),
      ]);

      return checks.every((check) => check === true);
    } catch (error) {
      if (error.name === "PluginDisabledError") {
        return false;
      } else {
        throw error;
      }
    }
  }

  async isCommandEnabled(guildId, commandName) {
    let command = this.chaos.getCommand(commandName);

    if (command.pluginName === 'core') {
      // core commands are always enabled
      return true;
    }

    if (command.pluginName) {
      const pluginEnabled = await this.pluginService.isPluginEnabled(guildId, command.pluginName);
      if (!pluginEnabled) {
        throw new PluginDisabledError(`Plugin ${command.pluginName} is disabled.`);
      }
    }

    return this._getEnabledCommands(guildId)
      .then((enabledCmds) => enabledCmds[command.name])
      .then((enabled) => typeof enabled === 'undefined' ? true : enabled);
  }

  canSendMessage(channel) {
    let botUser = this.chaos.discord.user;
    let permissions = channel.permissionsFor(botUser);
    return permissions.has(Discord.Permissions.FLAGS.SEND_MESSAGES);
  }

  async _getEnabledCommands(guildId) {
    let data = await this.getGuildData(guildId, DataKeys.ENABLED_COMMANDS);
    return data ? data : {};
  }

  async _setEnabledCommands(guildId, enabledCmds) {
    await this.setGuildData(guildId, DataKeys.ENABLED_COMMANDS, enabledCmds);
    return this._getEnabledCommands(guildId);
  }
}

module.exports = CommandService;
