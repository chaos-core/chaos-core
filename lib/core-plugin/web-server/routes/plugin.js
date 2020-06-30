const express = require('express');
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

router.post('/plugin/:pluginName/actions/:actionName', async (req, res, next) => {
  try {
    const actionService = req.chaos.getService('core', 'ActionService');
    const guild = req.chaos.discord.guilds.get(req.body.guildId);
    if (!guild) {
      res.status = 404;
      res.send({error: 'Guild not found'});
    }

    const result = await actionService.runAction(
      req.params.pluginName,
      req.params.actionName,
      guild.id,
      {
        message: null,
        channel: null,
        guild: guild,
        author: req.user,
        member: await guild.fetchMember(req.user.id),
        args: req.body.args,
      },
    );

    if (result && (result.content || result.embed)) {
      res.status = result.status;
      res.send(result);
    } else {
      res.status = 204;
      res.send();
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
