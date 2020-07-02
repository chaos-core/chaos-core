const express = require('express');
const router = express.Router();

router.get('/status', async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error);
  }
});

module.exports = router;
