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

  constructor(chaos, options = {}) {
    this.chaos = chaos;
    delete options.chaos;
    Object.assign(this, options);
  }
}

module.exports = CommandArg;
