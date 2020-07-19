const express = require('express');
const {requireInGuild, requireChaosPermission} = require('../../web-api-plugin/server/middleware.js');
const router = express.Router();

router.get('/plugin/:pluginName/actions', async (req, res, next) => {
  try {
    const pluginName = req.params.pluginName;

    const actions = req.chaos.configManager.actions
      .filter((action) => action.pluginName.toLowerCase() === pluginName.toLowerCase())
      .map((action) => ({
        name: action.name,
        description: action.description,
        args: action.args,
      }));

    res.send({actions});
  } catch (error) {
    next(error);
  }
});

router.patch('/:guildId/:pluginName',
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const pluginName = req.params.pluginName;

      if (typeof req.body.enabled !== 'undefined') {
        const pluginService = req.chaos.getService('core', 'PluginService');
        if (req.body.enabled) {
          await pluginService.enablePlugin(req.guild.id, pluginName);
          res.send({enabled: true});
        } else {
          await pluginService.disablePlugin(req.guild.id, pluginName);
          res.send({enabled: false});
        }
      }
    } catch (error) {
      next(error);
    }
  },
);

router.post('/:guildId/:pluginName/:actionName',
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const actionService = req.chaos.getService('core', 'ActionService');

      const response = await actionService.runAction(
        req.params.pluginName,
        req.params.actionName,
        req.guild.id,
        {
          message: null,
          channel: null,
          guild: req.guild,
          author: req.user,
          member: req.member,
          args: req.body.args,
        },
      );

      if (response && (response.content || response.embed)) {
        res.status = response.status;
        res.send({response});
      } else {
        res.status = 204;
        res.send();
      }
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
