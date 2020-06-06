const ConfigAction = require("../../../models/config-action");

class EnableCommandAction extends ConfigAction {
  name = 'enableCmd';
  description = 'Enable a command. Does not override disabled plugins.';

  args = [
    {
      name: 'command',
      description: 'The name of the command to enable',
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
    return this.chaos.strings.core.configActions.commands.enableCmd;
  }

  async run(context) {
    let commandName = context.args.command;
    let guild = context.guild;

    try {
      await this.commandService.enableCommand(guild.id, commandName);
    } catch (error) {
      switch (error.name) {
        case 'EnableCommandError':
          return { status: 500, content: error.message };
        case 'PluginDisabledError':
        case 'CommandNotFoundError':
          return { status: 400, content: error.message };
        default:
          throw error;
      }
    }
    return {
      status: 200,
      content: this.strings.hasBeenEnabled({ commandName }),
    };
  }
}

module.exports = EnableCommandAction;
