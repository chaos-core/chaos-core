const express = require('express');
const {requireInGuild, requireChaosPermission} = require('../../web-api-plugin/server/middleware.js');
const router = express.Router();

router.get('/:guildId/commands', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const pluginService = req.chaos.getService('core', 'PluginService');
      const pluginStatuses = await Promise.all(
        pluginService.plugins.map(async (plugin) => ({
          name: plugin.name,
          enabled: await pluginService.isPluginEnabled(req.guild.id, plugin.name),
        })),
      ).then((plugins) => plugins.reduce((statuses, plugin) => {
        statuses[plugin.name] = plugin.enabled;
        return statuses;
      }, {}));

      const commandService = req.chaos.getService('core', 'CommandService');
      const commands = await Promise.all(
        commandService.commands.map(async (command) => {
          const pluginEnabled = pluginStatuses[command.pluginName];
          let cmdEnabled;

          if (pluginEnabled) {
            cmdEnabled = await commandService.isCommandEnabled(req.guild.id, command.name);
          } else {
            cmdEnabled = false;
          }

          return {
            name: command.name,
            description: command.description,
            enabled: cmdEnabled,
            pluginName: command.pluginName,
            pluginEnabled: pluginStatuses[command.pluginName],
          };
        }),
      );

      res.send({commands});
    } catch (error) {
      next(error);
    }
  },
]);

router.patch('/:guildId/commands/:commandName', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    const commandName = req.params.commandName;

    try {
      if (typeof req.body.enabled !== 'undefined') {
        const commandService = req.chaos.getService('core', 'CommandService');

        if (req.body.enabled) {
          await commandService.enableCommand(req.guild.id, commandName);
          res.send({enabled: true});
        } else {
          await commandService.disableCommand(req.guild.id, commandName);
          res.send({enabled: false});
        }
      }
    } catch (error) {
      next(error);
    }
  },
]);

module.exports = router;
