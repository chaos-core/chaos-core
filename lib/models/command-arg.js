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

  async resolve(context, value) {
    switch (this.type) {
      case CommandArg.TYPES.string:
        return value;
      case CommandArg.TYPES.boolean:
        return value === 'true';
      case CommandArg.TYPES.channel:
        return this.chaos.getService('core', 'GuildService')
          .findChannel(context.guild, value);
      case CommandArg.TYPES.member:
        return this.chaos.getService('core', 'GuildService')
          .findMember(context.guild, value);
    }
  }
}

module.exports = CommandArg;
