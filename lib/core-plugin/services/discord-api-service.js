const axios = require('axios');
const queryString = require('query-string');

const Service = require('../../models/service.js');

class DiscordApiService extends Service {
  async getAccessToken(code) {
    const response = await axios({
      method: "POST",
      url: "https://discord.com/api/oauth2/token",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: queryString.stringify({
        client_id: this.chaos.config.web.clientId,
        client_secret: this.chaos.config.web.clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: this.chaos.config.web.clientUrl + "/login/callback",
        scope: 'identify guilds',
      }),
    });

    return response.data["access_token"];
  }

  async getUser(accessToken) {
    const response = await axios({
      method: "GET",
      url: "https://discord.com/api/users/@me",
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }
}

module.exports = DiscordApiService;
