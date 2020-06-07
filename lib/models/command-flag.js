const CommandArg = require('./command-arg');

class CommandFlag extends CommandArg {
  static TYPES = {
    ...CommandArg.TYPES,
  };

  sortAlias = null;
  type = CommandArg.TYPES.boolean;
  default = false;
}

module.exports = CommandFlag;

class HelpFlag extends CommandFlag {
  name = 'help';
  shortAlias = 'h';
  type = CommandFlag.TYPES.boolean;
  default = false;
  description = 'Display help for this command';
  showInHelp = false;
}

module.exports.HelpFlag = HelpFlag;
