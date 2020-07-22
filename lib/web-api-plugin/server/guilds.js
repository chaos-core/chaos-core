const express = require('express');
const DiscordJsonEncoder = require('../discord-json-encoder.js');
const {requireInGuild} = require('./middleware.js');
const router = express.Router();

router.get('/guilds', async (req, res, next) => {
  try {
    const guilds = {};

    for (const guild of req.chaos.discord.guilds.array()) {
      const member = await guild.fetchMember(req.user.id);
      if (member) {
        guilds[guild.id] = DiscordJsonEncoder.encodeGuild(guild);
      }
    }

    res.send({guilds});
  } catch (error) {
    next(error);
  }
});

router.get('/:guildId',
  requireInGuild((req) => req.params.guildId),
  (req, res) => {
    const guild = DiscordJsonEncoder.encodeGuild(req.guild);
    res.send({guild});
  },
);

router.get('/:guildId/plugins',
  requireInGuild((req) => req.params.guildId),
  async (req, res, next) => {
    try {
      const chaos = req.chaos;
      const pluginService = chaos.getService('core', 'PluginService');

      const plugins = {};
      for (const plugin of chaos.pluginManager.plugins) {
        if (plugin.name === 'web-api') continue;

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

router.get('/:guildId/members',
  requireInGuild((req) => req.params.guildId),
  async (req, res, next) => {
    try {
      const members = req.guild.members.map(DiscordJsonEncoder.encodeMember);
      res.send({members});
    } catch(error) {
      next(error);
    }
  },
);

router.get('/:guildId/roles',
  requireInGuild((req) => req.params.guildId),
  async (req, res, next) => {
    try {
      const roles = req.guild.roles.map(DiscordJsonEncoder.encodeRole);
      res.send({roles});
    } catch(error) {
      next(error);
    }
  },
);

router.get('/:guildId/channels',
  requireInGuild((req) => req.params.guildId),
  async (req, res, next) => {
    try {
      const channels = req.guild.channels.map(DiscordJsonEncoder.encodeChannel);
      res.send({channels});
    } catch(error) {
      next(error);
    }
  },
);


module.exports = router;
