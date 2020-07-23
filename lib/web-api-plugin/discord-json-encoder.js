const DiscordJsonEncoder = {
  encodeUser: (user) => {
    return {
      avatar: user.avatar,
      avatarURL: user.avatarURL,
      bot: user.bot,
      defaultAvatarURL: user.defaultAvatarURL,
      discriminator: user.discriminator,
      displayAvatarURL: user.displayAvatarURL,
      id: user.id,
      tag: user.tag,
      username: user.username,
    };
  },

  encodeMember: (member) => {
    return {
      displayName: member.displayName,
      id: member.id,
      nickname: member.nickname,
      user: DiscordJsonEncoder.encodeUser(member.user),
    };
  },

  encodeGuild: (guild) => {
    return {
      description: guild.description,
      icon: guild.icon,
      iconURL: guild.iconURL,
      id: guild.id,
      memberCount: guild.memberCount,
      name: guild.name,
      nameAcronym: guild.nameAcronym,
      owner: DiscordJsonEncoder.encodeMember(guild.owner),
      ownerID: guild.ownerID,
      region: guild.region,
    };
  },

  encodeRole: (role) => {
    return {
      color: role.color,
      hexColor: role.hexColor,
      id: role.id,
      mentionable: role.mentionable,
      name: role.name,
      position: role.position,
    };
  },

  encodeChannel: (channel) => {
    return {
      id: channel.id,
      name: channel.name,
      parent: channel.parent ? DiscordJsonEncoder.encodeChannel(channel.parent) : null,
      parentID: channel.parentID,
      position: channel.position,
      type: channel.type,
    };
  },
};

module.exports = DiscordJsonEncoder;
