const createError = require('http-errors');

const authorize = async (req, res, next) => {
  try {
    if (!req.headers['authorization']) {
      return next(createError(401, 'Missing Authorization Header'));
    }

    const [type, token] = req.headers['authorization'].split(' ');
    if (type.toLowerCase() !== 'bearer') {
      return next(createError(401, 'Invalid Authorization Header'));
    }

    const webAuthService = req.chaos.getService('web-api', 'WebAuthService');
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
  } catch (error) {
    next(error);
  }
};

const requireInGuild = (getGuildId) => async (req, res, next) => {
  try {
    const guild = req.chaos.discord.guilds.get(getGuildId(req));
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
  } catch (error) {
    next(error);
  }
};

const requireChaosPermission = (level) => async (req, res, next) => {
  try {
    if (!req.guild) {
      return next(createError(500, 'requireInGuild() must be called before requireChaosPermission()'));
    }

    const permissionsService = req.chaos.getService('core', 'PermissionsService');
    if (await permissionsService.hasPermissionLevel(req.guild, req.member, level)) {
      next();
    } else {
      return next(createError(401, `User does not have permission level ${level}`));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  authorize,
  requireInGuild,
  requireChaosPermission,
};
