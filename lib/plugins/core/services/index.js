const CommandService = require('./command-service');
const DiscordApiService = require("./discord-api-service.js");
const PermissionsService = require('./permissions-service');
const PluginService = require('./plugin-service');
const RoleService = require('./role-service');
const UserService = require('./user-service');
const WebApiService = require("./web-api-service.js");
const WebAuthService = require("./web-auth-service.js");

module.exports = {
  CommandService,
  PluginService,
  PermissionsService,
  RoleService,
  UserService,
  DiscordApiService,
  WebApiService,
  WebAuthService,
};

