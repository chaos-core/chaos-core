class CommandArg {
  static TYPES = {
    string: 'string',
    boolean: 'boolean',
    int: 'int',
    float: 'float',
    channel: 'channel',
    member: 'member',
  };

  static async resolve(context, arg, value) {
    switch (arg.type) {
      case CommandArg.TYPES.string:
        return value;
      case CommandArg.TYPES.boolean:
        return value === 'true';
      case CommandArg.TYPES.int:
        return Number.parseInt(value);
      case CommandArg.TYPES.float:
        return Number.parseFloat(value);
      case CommandArg.TYPES.channel:
        return context.chaos.getService('core', 'GuildService')
          .findChannel(context.guild, value);
      case CommandArg.TYPES.member:
        return context.chaos.getService('core', 'GuildService')
          .findMember(context.guild, value);
      default:
        return value;
    }
  }
}

module.exports = CommandArg;
