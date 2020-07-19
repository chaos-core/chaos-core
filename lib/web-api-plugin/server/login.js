const express = require('express');

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const code = req.body.code;
    const webAuthService = req.chaos.getService('web-api', 'WebAuthService');

    const jwt = await webAuthService.authenticateCode(code);
    res.send({jwt});
  } catch (error) {
    next(error);
  }
});

module.exports = router;
