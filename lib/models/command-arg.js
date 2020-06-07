class CommandArg {
  static TYPES = {
    string: 'string',
    boolean: 'boolean',
    channel: 'channel',
    member: 'member',
  };

  name = '';
  description = '';
  type = CommandArg.TYPES.string;
  default = null;
  showInHelp = true;
  required = false;

  constructor(options = {}) {
    Object.assign(this, options);
  }
}

module.exports = CommandArg;
