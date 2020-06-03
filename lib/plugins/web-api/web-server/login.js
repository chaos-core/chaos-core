const express = require("express");
const axios = require('axios');
const queryString = require('query-string');

const router = express.Router();

router.post('/login', async (req, res) => {
  const code = req.body.code;

  try {
    const loginResponse = await axios({
      method: "POST",
      url: "https://discord.com/api/oauth2/token",
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: queryString.stringify({
        client_id: req.chaos.config.web.clientId,
        client_secret: req.chaos.config.web.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: req.chaos.config.web.clientUrl + "/login/callback",
        scope: 'identify guilds',
      }),
    });

    const accessToken = loginResponse.data["access_token"];
    const userResponse = await axios({
      method: "GET",
      url: "https://discord.com/api/users/@me",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    res.send({ user: userResponse.data });
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
