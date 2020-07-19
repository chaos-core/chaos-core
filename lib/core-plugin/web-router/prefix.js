const express = require('express');

const {requireChaosPermission, requireInGuild} = require('../../web-api-plugin/server/middleware.js');

const router = express.Router();

router.get('/:guildId/prefix', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const commandService = req.chaos.getService('core', 'commandService');
      const prefix = await commandService.getPrefix(req.guild.id);
      res.send({prefix});
    } catch (error) {
      next(error);
    }
  },
]);

router.put('/:guildId/prefix', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const commandService = req.chaos.getService('core', 'commandService');
      const prefix = req.body.prefix;
      const newPrefix = await commandService.setPrefix(req.guild, prefix);
      res.send({prefix: newPrefix});
    } catch (error) {
      next(error);
    }
  },
]);

module.exports = router;
