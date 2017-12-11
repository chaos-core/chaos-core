const Rx = require('rx');

const Command = require('../models/command');
const Response = require('../models/response');
const Context = require('../models/context');
const CommandParser = require('../utility/command-parser');

const COMMANDS_KEYWORD = 'core.commands';
const REQUIRED_COMMANDS = ['help', 'config'];

class CommandManager {
  constructor (commands = [], commandPrefix = '!') {
    this._commands = {};
    this.commandPrefix = commandPrefix;

    commands.forEach((command) => {
      this.addCommand(command);
    });
  }

  get commands () {
    return this._commands;
  }

  /**
   * Registers a new command
   *
   * @param command {Object}
   *   @param command.name {string} The name of the command
   *   @param command.description {string} The description of the command
   *   @param command.args {Array<Object>} List of arguments for the command
   *     @pram command.args[].name {string} The name of the argument
   *     @pram command.args[].description {string} The description of the argument
   *     @pram command.args[].required {boolean} Mark the argument as required
   *     @pram command.args[].showInHelp {boolean} Hide or show argument in the help list
   *   @param command.flags {Array<Object>} List of flags for the command
   *     @pram command.flags[].name {string} The name of the flag
   *     @pram command.flags[].description {string} The description of the flag
   *     @pram command.flags[].required {boolean} Mark the flag as required
   *     @pram command.flags[].type {string} The type of the flag. Can be "string", or "boolean"
   *     @pram command.flags[].showInHelp {boolean} Hide or show flag in the help list
   *   @param command.adminOnly {boolean} Hide the command unless the caller is an admin
   *   @param command.showInHelp {boolean} Hide or show command in the help list
   *   @param command.enabledByDefault {boolean} Sets the command as enabled by default when first added to a server
   *   @param command.run {function(Context): ObservableOrPromise} function to call as the body of the command
   */
  addCommand(command) {
    this.commands[command.name.toLowerCase()] = new Command(command);
  }

  msgIsCommand(message) {
    if (!message.content.startsWith(this.commandPrefix)) { return false; }

    let commandName = CommandParser.getCommandName(message, this.commandPrefix);
    return typeof this.commands[commandName] !== 'undefined';
  }

  runCommandForMsg(message, nix) {
    let commandName = CommandParser.getCommandName(message, this.commandPrefix);
    let command = this.commands[commandName];

    let params = CommandParser.getParams(command, message);

    let context = new Context(message, nix, params);
    let response = new Response(message);

    return Rx.Observable.return()
      .flatMap(() => this._filterCommandEnabled(command, context, response))
      .flatMap(() => this._filterScope(command, context, response))
      .flatMap(() => this._filterHasPermission(command, context, response))
      .flatMap(() => this._filterHelpFlag(command, context, response))
      .flatMap(() => this._filterMissingArgs(command, context, response))
      .map(() => command.run(context, response))
      .flatMap((cmdExit) => {
        if (typeof cmdExit === 'undefined') { return Rx.Observable.return(); }
        if (cmdExit instanceof Rx.Observable) { return cmdExit; }
        if (typeof cmdExit.then === 'function') { return Rx.Observable.fromPromise(cmdExit); }
        return Rx.Observable.return();
      })
      .catch((error) => nix.handleError(context, error));
  }

  enableCommand(context, commandName) {
    if (!this.commands[commandName]) {
      return Rx.Observable.throw(new Error(`Command does not exist`));
    }

    return this._getCommandsData(context)
      .do((commands) => commands[commandName] = true)
      .flatMap((commands) => this._setCommandsData(context, commands))
      .map((commands) => commands[commandName]);
  }

  disableCommand(context, commandName) {
    // required commands must always be enabled
    if (REQUIRED_COMMANDS.includes(commandName)) {
      return Rx.Observable.throw(new Error(`Command can not be disabled`));
    }

    if (!this.commands[commandName]) {
      return Rx.Observable.throw(new Error(`Command does not exist`));
    }

    return this._getCommandsData(context)
      .do((commands) => commands[commandName] = false)
      .flatMap((commands) => this._setCommandsData(context, commands))
      .map((commands) => commands[commandName]);
  }

  isCommandEnabled(context, commandName) {
    // required commands must always be enabled
    if (REQUIRED_COMMANDS.includes(commandName)) {
      return Rx.Observable.return(true);
    }

    return this._getCommandsData(context)
      .map((commands) => commands[commandName])
      .map((isEnabled) => {
        if(typeof isEnabled === 'undefined') {
          return this.commands[commandName].enabledByDefault;
        }
        return isEnabled;
      });
  }

  _getCommandsData(context) {
    return context.nix.dataManager
      .getGuildData(context.guild.id, COMMANDS_KEYWORD)
      .map((commands) => !commands ? {} : commands);
  }

  _setCommandsData(context, commands) {
    return context.nix.dataManager
      .setGuildData(context.guild.id, COMMANDS_KEYWORD, commands);
  }

  _filterCommandEnabled(command, context) {
    return this.isCommandEnabled(context, command.name)
      .filter(Boolean);
  }

  _filterHasPermission(command, context, response) {
    return context.nix.permissionsManager.filterHasPermission(command, context, response);
  }

  _filterHelpFlag(command, context, response) {
    if (context.flags['help'] === true) {
      response.type = 'embed';
      response.content = context.nix.responseStrings.commandParsing.help({});
      response.embed = command.helpEmbed();
      response.send();
      return Rx.Observable.empty();
    }
    return Rx.Observable.return(true);
  }

  _filterScope(command, context, response) {
    if (command.scope.length === 0) {
      return Rx.Observable.return(true);
    }
    else if (command.scope.indexOf(context.channel.type) === -1) {
      response.type = 'message';

      if (command.scope.length === 1 && command.scope[0] === 'text') {
        response.content = context.nix.responseStrings.commandParsing.error.wrongScope.textChannelOnly({});
      }
      else {
        response.content = context.nix.responseStrings.commandParsing.error.wrongScope.generic({});
      }

      response.send();
      return Rx.Observable.empty();
    }
    else {
      return Rx.Observable.return(true);
    }
  }

  _filterMissingArgs(command, context, response) {
    let ignoreArgReqsFlags = command.flags.filter((f) => f.ignoreArgReqs);
    if (ignoreArgReqsFlags.find((f) => context.flags[f.name])) {
      return Rx.Observable.return(true);
    }

    if (command.requiredArgs.some((arg) => typeof context.args[arg.name] === 'undefined')) {
      response.type = 'embed';
      response.content = context.nix.responseStrings.commandParsing.error.missingArgument({});
      response.embed = command.helpEmbed();
      response.send();
      return Rx.Observable.empty();
    }
    return Rx.Observable.return(true);
  }
}

CommandManager.COMMANDS_KEYWORD = COMMANDS_KEYWORD;
CommandManager.REQUIRED_COMMANDS = REQUIRED_COMMANDS;

module.exports = CommandManager;
