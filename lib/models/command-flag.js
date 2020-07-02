const CommandArg = require('./command-arg');

class CommandFlag extends CommandArg {
  static TYPES = {
    ...CommandArg.TYPES,
  };

  static helpFlag = {
    name: 'help',
    shortAlias: 'h',
    type: CommandFlag.TYPES.boolean,
    default: false,
    description: 'Display help for this command',
    showInHelp: false,
  };
}

module.exports = CommandFlag;
