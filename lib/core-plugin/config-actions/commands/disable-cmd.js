const ConfigAction = require("../../../models/config-action");

class DisableCommandAction extends ConfigAction {
  name = 'disableCmd';
  description = "Explicitly disable a command.";

  args = [
    {
      name: 'command',
      description: 'The name of the command to disable',
      required: true,
      type: 'string',
    },
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.commandService = this.getService('core', 'commandService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.commands.disableCmd;
  }

  async run(context) {
    try {
      let commandName = context.args.command;
      let guild = context.guild;

      await this.commandService.disableCommand(guild.id, commandName);
      return {
        status: 200,
        content: this.strings.hasBeenDisabled({ commandName }),
      };
    } catch (error) {
      switch (error.name) {
        case 'DisableCommandError':
          return {
            status: 500,
            content: error.message,
          };
        case 'PluginDisabledError':
        case 'CommandNotFoundError':
        case 'ReqCommandError':
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

module.exports = DisableCommandAction;
