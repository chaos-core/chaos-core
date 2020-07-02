const Service = require('../../models/service.js');
const {asPromise} = require('../../utility.js');
const {PluginNotEnabledError} = require('../../errors');


class ActionService extends Service {
  async runAction(pluginName, actionName, guildId, context) {
    const pluginService = this.getService('core', 'PluginService');

    let pluginEnabled = await pluginService.isPluginEnabled(guildId, pluginName);
    if (!pluginEnabled) {
      throw new PluginNotEnabledError(`The plugin ${pluginName} is not enabled.`);
    }

    let action = this.chaos.getConfigAction(pluginName, actionName);
    return asPromise(action.execAction(context));
  }
}

module.exports = ActionService;
