const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.send({ message: "Alive and well!" });
});

router.get('/status', async (req, res) => {
  const plugins = req.chaos.pluginManager.plugins.map((plugin) => ({
    name: plugin.name,
  }));

  const guilds = req.chaos.discord.guilds.map((guild) => ({
    id: guild.id,
    name: guild.name,
  }));

  res.send({
    listening: true,
    plugins,
    guilds,
  });
});

module.exports = router;
