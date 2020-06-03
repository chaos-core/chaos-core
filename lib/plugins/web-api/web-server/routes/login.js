const express = require("express");

const router = express.Router();

router.post('/login', async (req, res) => {
  const code = req.body.code;
  const webAuthService = req.chaos.getService('webApi', 'WebAuthService');

  try {
    const jwt = await webAuthService.authenticateCode(code);
    res.send({ jwt });
  } catch (error) {
    res.status(500);
    res.send(error);
  }
});

module.exports = router;
