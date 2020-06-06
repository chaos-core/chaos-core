const ConfigAction = require("../../../models/config-action");
const { ChaosError } = require("../../../errors");

class EnablePluginAction extends ConfigAction {
  name = "enablePlugin";
  description = 'enable a plugin';

  args = [
    {
      name: 'pluginName',
      description: 'the name of the plugin to enable',
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
    return this.chaos.strings.core.configActions.plugins.enablePlugin;
  }

  async run(context) {
    try {
      const chaos = this.chaos;
      const pluginName = context.args.pluginName;
      const plugin = chaos.getPlugin(pluginName);

      await this.pluginService.enablePlugin(context.guild.id, plugin.name);
      return {
        status: 200,
        content: this.strings.pluginEnabled({ pluginName: plugin.name }),
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

module.exports = EnablePluginAction;
