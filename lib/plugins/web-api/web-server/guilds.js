const express = require('express');
const router = express.Router();

router.get('/guilds', async (req, res) => {
  const guilds = {};
  for (const guild of req.chaos.discord.guilds.array()) {
    guilds[guild.id] = {
      ...guild,
    };
  }

  res.send({ guilds });
});

router.get('/guilds/:id', async (req, res) => {
  const guildId = req.params.id;
  const guild = req.chaos.discord.guilds.get(guildId);
  res.send(guild);
});

router.get('/guilds/:id/plugins', async (req, res) => {
  const chaos = req.chaos;
  const pluginService = chaos.getService('core', 'PluginService');

  const guildId = req.params.id;

  const plugins = {};
  for (const plugin of chaos.pluginManager.plugins) {
    plugins[plugin.name] = {
      name: plugin.name,
      enabled: await pluginService.isPluginEnabled(guildId, plugin.name),
    };
  }

  res.send({ plugins });
});

module.exports = router;
