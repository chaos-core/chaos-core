const jwt = require('jsonwebtoken');
const util = require('util');

const Service = require('../../../models/service');

const signJwt = util.promisify(jwt.sign);

const JWT_ALGORITHM = "HS256";

class WebAuthService extends Service {
  get jwtSecret() {
    return this.chaos.config.web.jwtSecret;
  }

  async authenticateCode(code) {
    const discordApiService = this.getService('webApi', 'DiscordApiService');

    const accessToken = await discordApiService.getAccessToken(code);
    const userData = await discordApiService.getUser(accessToken);

    return this.createAuthToken(userData);
  }

  async createAuthToken(userData) {
    const payload = {
      id: userData.id,
      tag: `${userData.username}#${userData.discriminator}`,
      avatar: userData.avatar,
    };

    return signJwt(payload, this.jwtSecret, { algorithm: JWT_ALGORITHM });
  }
}

module.exports = WebAuthService;
