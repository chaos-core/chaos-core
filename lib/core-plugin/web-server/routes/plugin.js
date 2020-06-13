const express = require('express');
const router = express.Router();

router.get('/plugin/:pluginName/actions', async (req, res) => {
  const pluginName = req.params.pluginName;

  const actions = req.chaos.configManager.actions
    .filter((action) => action.pluginName.toLowerCase() === pluginName.toLowerCase())
    .map((action) => ({
      name: action.name,
      description: action.description,
      args: action.args,
    }));

  res.send({actions});
});

module.exports = router;
