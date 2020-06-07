class CommandArg {
  static TYPES = {
    string: 'string',
    boolean: 'boolean',
    int: 'int',
    float: 'float',
    channel: 'channel',
    member: 'member',
  };

  name = '';
  description = '';
  type = CommandArg.TYPES.string;
  default = null;
  showInHelp = true;
  required = false;
  sanitizeArgs = true;

  constructor(chaos, options = {}) {
    this.chaos = chaos;
    delete options.chaos;
    Object.assign(this, options);
  }

  async resolve(context, value) {
    switch (this.type) {
      case CommandArg.TYPES.string:
        return value;
      case CommandArg.TYPES.boolean:
        return value === 'true';
      case CommandArg.TYPES.int:
        return Number.parseInt(value);
      case CommandArg.TYPES.float:
        return Number.parseFloat(value);
      case CommandArg.TYPES.channel:
        return this.chaos.getService('core', 'GuildService')
          .findChannel(context.guild, value);
      case CommandArg.TYPES.member:
        return this.chaos.getService('core', 'GuildService')
          .findMember(context.guild, value);
      default:
        return value;
    }
  }
}

module.exports = CommandArg;
