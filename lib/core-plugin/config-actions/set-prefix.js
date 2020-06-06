const ConfigAction = require("../../models/config-action");

class SetPrefixAction extends ConfigAction {
  name = 'setPrefix';
  description = 'Change the prefix for this server.';

  args = [
    {
      name: 'prefix',
      required: true,
      type: 'string',
      description: 'The new prefix to use for commands.',
    },
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.commandService = this.getService('core', 'commandService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.setPrefix;
  }

  async run(context) {
    let prefix = context.args.prefix;

    let newPrefix = await this.commandService.setPrefix(context.guild, prefix);
    return {
      status: 200,
      content: this.strings.prefixChanged({ newPrefix }),
    };
  }
}

module.exports = SetPrefixAction;
