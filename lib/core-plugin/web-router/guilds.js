const express = require('express');
const {requireInGuild} = require('../web-server/middleware.js');
const router = express.Router();

router.get('/guilds', async (req, res, next) => {
  try {
    const guilds = {};

    for (const guild of req.chaos.discord.guilds.array()) {
      const member = await guild.fetchMember(req.user.id);
      if (member) {
        guilds[guild.id] = guild;
      }
    }

    res.send({guilds});
  } catch (error) {
    next(error);
  }
});

router.get('/:guildId',
  requireInGuild((req) => req.params.guildId),
  (req, res) => res.send({guild: req.guild}),
);

router.get('/:guildId/plugins',
  requireInGuild((req) => req.params.guildId),
  async (req, res, next) => {
    try {
      const chaos = req.chaos;
      const pluginService = chaos.getService('core', 'PluginService');

      const plugins = {};
      for (const plugin of chaos.pluginManager.plugins) {
        plugins[plugin.name] = {
          name: plugin.name,
          enabled: await pluginService.isPluginEnabled(req.guild.id, plugin.name),
        };
      }

      res.send({plugins});
    } catch (error) {
      next(error);
    }
  },
);

module.exports = router;
