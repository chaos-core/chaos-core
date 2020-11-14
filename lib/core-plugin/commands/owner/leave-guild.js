const Command = require('../../../models/command');

class LeaveGuildCommand extends Command {
  name = 'owner:leaveGuild';
  description = 'leave a guild';
  ownerOnly = true;

  args = [
    {
      name: 'guildId',
      description: 'The guild ID of the server to leave',
    },
  ];

  async run(context, response) {
    let { guildId } = context.args;
    let guild = this.chaos.discord.guilds.get(guildId);

    await guild.leave();
    await response.send({
      content: `Left guild *${guild.name}* (${guild.id})`,
    });
  }
}

module.exports = LeaveGuildCommand;
