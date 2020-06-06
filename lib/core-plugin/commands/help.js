const Command = require("../../models/command");

class HelpCommand extends Command {
  name = 'help';
  description = 'See all commands that I can do';

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.commandService = this.getService('core', 'commandService');
      this.permissionsService = this.getService('core', 'permissionsService');

      this.commandManager = this.chaos.commandManager;
    });
  }

  get strings() {
    return this.chaos.strings.core.commands.help;
  }

  async run(context, response) {
    let allowedCommands = await this.getAllowedCommands(context);
    let helpList = this.buildHelpList(context.guild, allowedCommands);
    return Promise.all([
      response.send({
        type: 'dm',
        content: this.strings.whatICanDo({ helpFlag: "--help" }) + `\n\n${helpList}`,
      }),
      response.send({
        type: 'message',
        content: this.strings.checkYourDms(),
      }),
    ]);
  }

  buildHelpList(guild, allowedCommands) {
    let prefix = this.commandService.getPrefix(guild.id);

    let commandsByPlugin = {};
    allowedCommands.forEach((command) => {
      if (!commandsByPlugin[command.pluginName]) {
        commandsByPlugin[command.pluginName] = [];
      }

      commandsByPlugin[command.pluginName].push(command);
    });

    let pluginLists = Object.entries(commandsByPlugin).map(([pluginName, commands]) => {
      let pluginCommands = `**${pluginName}**\n`;
      pluginCommands += commands.map((command) => (
        `> ${prefix}${command.name}\n` +
        `>    *${command.description.replace('\n', '\n>    ')}*`
      )).join('\n');
      return pluginCommands;
    });

    return pluginLists.join('\n\n');
  }

  async getAllowedCommands(context) {
    let allowedCommands = [];

    for (const command of this.commandManager.commands) {
      let allowed = await this.isCommandAllowed(context, command);
      if (allowed) { allowedCommands.push(command); }
    }

    return allowedCommands;
  }

  async isCommandAllowed(context, command) {
    try {
      let commandEnabled = await this.commandService.isCommandEnabled(context.guild.id, command.name);
      let hasPerm = await this.permissionsService.hasPermission(context, command.name);
      return commandEnabled && hasPerm;
    } catch (error) {
      if (error.name === "PluginDisabledError") {
        return false;
      } else {
        throw error;
      }
    }
  }
}

module.exports = HelpCommand;


