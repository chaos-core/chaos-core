const Command = require('../../../../models/command');

class ListGuildsCommand extends Command {
  name = 'owner:listGuilds';
  description = 'list all servers the bot is connected to';
  ownerOnly = true;

  async run(context, response) {
    let strings = this.chaos.strings.core.commands.owner.listGuilds;

    let guilds = this.chaos.discord.guilds
      .map((guild) => `- ${guild.name} (${guild.id})`);

    await response.send({ content: `${strings.inGuilds()}\n${guilds.join('\n')}` });
  }
}

module.exports = ListGuildsCommand;
