const Discord = require('discord.js');

const ConfigAction = require("../../../../models/config-action");

class ListPluginAction extends ConfigAction {
  name = "listPlugins";
  description = 'list all plugins';

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.pluginService = this.getService('core', 'pluginService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.plugins.listPlugins;
  }

  async run(context) {
    const guild = context.guild;
    const pluginListings = [];

    for (const plugin of this.chaos.pluginManager.plugins) {
      const enabled = await this.pluginService.isPluginEnabled(guild.id, plugin.name);
      pluginListings.push({
        name: plugin.name + (enabled ? "" : " (disabled)"),
        value: plugin.description ? plugin.description : '*[No description]*',
      });
    }

    const embed = new Discord.RichEmbed();
    embed.fields = pluginListings
      .sort(({ name: nameA }, { name: nameB }) => (nameA > nameB) ? 1 : -1);

    return {
      status: 200,
      content: this.strings.allPlugins(),
      embed: embed,
    };
  }
}

module.exports = ListPluginAction;
