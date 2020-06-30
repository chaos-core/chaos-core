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

module.exports = {
  authorize,
};
