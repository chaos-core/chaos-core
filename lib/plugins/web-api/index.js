module.exports = {
  name: 'WebApi',
  description: "ChaosCore Web API",
  services: [
    require("./services/discord-api-service"),
    require("./services/web-api-service"),
    require("./services/web-auth-service"),
  ],
};
