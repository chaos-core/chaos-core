const createError = require('http-errors');

const authorize = async (req, res, next) => {
  if (!req.headers['authorization']) {
    return next(createError(401, 'Missing Authorization Header'));
  }

  const [type, token] = req.headers['authorization'].split(' ');
  if (type.toLowerCase() !== 'bearer') {
    return next(createError(401, 'Invalid Authorization Header'));
  }

  const webAuthService = req.chaos.getService('core', 'WebAuthService');
  const user = await webAuthService.decodeAuthToken(token);
  if (!user.id) {
    return next(createError(401, 'Invalid Authorization Token'));
  }

  const discordUser = await req.chaos.discord.fetchUser(user.id);
  if (!discordUser) {
    return next(createError(401, 'Invalid Authorization Token'));
  }

  req.user = discordUser;
  next();
};

const requireInGuild = (getGuildId) => async (req, res, next) => {
  const guild = req.chaos.discord.guilds.get(getGuildId(res));
  if (!guild) {
    return next(createError(404, 'Guild not found'));
  }

  const member = await guild.fetchMember(req.user.id);
  if (!guild) {
    return next(createError(401, 'User not in guild'));
  }

  req.guild = guild;
  req.member = member;
  next();
};

module.exports = {
  authorize,
  requireInGuild,
};
