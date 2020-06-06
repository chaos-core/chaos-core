const ConfigAction = require("../../../models/config-action");
const { ChaosError } = require("../../../errors");

class DisablePluginAction extends ConfigAction {
  name = "disablePlugin";
  description = 'disable a plugin';

  args = [
    {
      name: 'pluginName',
      description: 'the name of the plugin to disable',
      required: true,
    },
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.pluginService = this.getService('core', 'pluginService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.plugins.disablePlugin;
  }

  async run(context) {
    try {
      const chaos = this.chaos;
      const pluginName = context.args.pluginName;
      const plugin = chaos.getPlugin(pluginName);

      await this.pluginService.disablePlugin(context.guild.id, plugin.name);
      return {
        status: 200,
        content: this.strings.pluginDisabled({ pluginName: plugin.name }),
      };
    } catch (error) {
      if (error instanceof ChaosError) {
        return { status: 400, content: error.message };
      } else {
        throw error;
      }
    }
  }
}

module.exports = DisablePluginAction;
