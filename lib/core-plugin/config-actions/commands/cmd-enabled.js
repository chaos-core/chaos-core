const ConfigAction = require("../../../models/config-action");

class CommandIsEnabledAction extends ConfigAction {
  name = 'cmdEnabled?';
  description = 'check if a command is enabled';
  args = [
    {
      name: 'command',
      required: true,
      type: 'string',
      description: 'The name of the command to check',
    },
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.commandService = this.getService('core', 'commandService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.commands.cmdEnabled;
  }

  async run(context) {
    try {
      let commandName = context.args.command;

      let enabled = await this.commandService.isCommandEnabled(context.guild.id, commandName);
      return {
        status: 200,
        content: (
          enabled
            ? this.strings.isEnabled({ commandName })
            : this.strings.isDisabled({ commandName })
        ),
      };
    } catch (error) {
      switch (error.name) {
        case "PluginDisabledError":
        case "CommandNotFoundError":
          return {
            status: 400,
            content: error.message,
          };
        default:
          throw error;
      }
    }
  }
}

module.exports = CommandIsEnabledAction;
