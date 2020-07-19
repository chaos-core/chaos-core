const WebApiService = require('./services/web-api-service.js');
const WebAuthService = require('./services/web-auth-service.js');

module.exports = {
  name: 'web-api',
  description: 'Provides a web API for configuring bots',

  services: [
    WebApiService,
    WebAuthService,
  ],
};
