const Service = require('../../models/service');
const DataKeys = require('../datakeys');
const { PermLevelError } = require("../../errors");

class PermissionsService extends Service {
  getDatakey(level) {
    return DataKeys.PERMISSIONS + '.' + level;
  }

  async getPermissionsData(guildId, levelName) {
    const level = this.chaos.getPermissionLevel(levelName);
    let savedData = await this.getGuildData(guildId, this.getDatakey(level));

    if (!savedData) {
      savedData = await this.setPermissionsData(guildId, level, {
        name: level,
        users: [],
        roles: [],
      });
    }

    return savedData;
  }

  async setPermissionsData(guildId, levelName, data) {
    const level = this.chaos.getPermissionLevel(levelName);
    return this.setGuildData(guildId, this.getDatakey(level), data);
  }

  async addUser(guild, level, user) {
    let savedData = await this.getPermissionsData(guild.id, level);

    let users = savedData.users;
    if (users.indexOf(user.id) !== -1) {
      throw new PermLevelError(`The user ${user.username} already has the permission level ${level}`);
    }

    this.chaos.logger.info(`[${guild.name}] Granting ${level} to ${user.tag}`);
    users.push(user.id);
    return this.setPermissionsData(guild.id, level, savedData)
      .then((savedData) => savedData.users.indexOf(user.id) !== -1);
  }

  async removeUser(guild, level, user) {
    let savedData = await this.getPermissionsData(guild.id, level);

    let users = savedData.users;
    let index = users.indexOf(user.id);
    if (index === -1) {
      throw new PermLevelError(`The user ${user.username} does not have the permission level ${level}`);
    }

    this.chaos.logger.info(`[${guild.name}] Revoking ${level} from ${user.tag}`);
    users.splice(index, 1);
    return this.setPermissionsData(guild.id, level, savedData)
      .then((savedData) => savedData.users.indexOf(user.id) === -1);
  }

  async addRole(guild, level, role) {
    const savedData = await this.getPermissionsData(guild.id, level);

    let roles = savedData.roles;
    if (roles.indexOf(role.id) !== -1) {
      throw new PermLevelError(`The role ${role.name} already has the permission level ${level}`);
    }

    this.chaos.logger.info(`[${guild.name}] Granting ${level} to ${role.name}`);
    roles.push(role.id);
    return this.setPermissionsData(guild.id, level, savedData)
      .then((savedData) => savedData.roles.indexOf(role.id) !== -1);
  }

  async removeRole(guild, level, role) {
    const savedData = await this.getPermissionsData(guild.id, level);
    let roles = savedData.roles;
    let index = roles.indexOf(role.id);
    if (index === -1) {
      throw new PermLevelError(`The role ${role.name} does not have the permission level ${level}`);
    }

    this.chaos.logger.info(`[${guild.name}] Revoking ${level} from ${role.name}`);
    roles.splice(index, 1);
    return this.setPermissionsData(guild.id, level, savedData)
      .then((savedData) => savedData.roles.indexOf(role.id) !== -1);
  }

  async hasPermission(context, commandName) {
    let command = this.chaos.getCommand(commandName);

    if (command.ownerOnly && context.author.id !== this.chaos.owner.id) {
      // command is for the owner only.
      this.chaos.logger.verbose('Command can only be ran by the bot owner.');
      return false;
    }

    if (context.author.id === this.chaos.owner.id) {
      // Bot owner always has permission
      this.chaos.logger.verbose('User is bot owner; By-passing permissions');
      return true;
    }

    if (context.author.id === context.guild.ownerID) {
      // Guild owner always has permission
      this.chaos.logger.verbose('User is guild owner; By-passing permissions');
      return true;
    }

    if (command.adminOnly) {
      this.chaos.logger.verbose('Command is admin only.');
      return this.hasPermissionLevel(context.guild, context.member, 'admin');
    }

    if (command.permissions.length === 0) {
      // No specified levels, default to true
      this.chaos.logger.verbose('Command has no specified permissions.');
      return true;
    }

    return Promise
      .all(command.permissions.map((level) => {
        return this.hasPermissionLevel(context.guild, context.member, level);
      }))
      .then((levels) => levels.some((hasLevel) => hasLevel === true));
  }

  async hasPermissionLevel(guild, member, level) {
    const levelData = await this.getPermissionsData(guild.id, level);
    if (levelData.users.indexOf(member.user.id) !== -1) {
      this.chaos.logger.verbose(`User has permission level ${levelData.name}`);
      return true;
    } else if (member.roles.some((r) => levelData.roles.indexOf(r.id) !== -1)) {
      this.chaos.logger.verbose(`One of the user's roles has permission level ${levelData.name}`);
      return true;
    } else {
      this.chaos.logger.verbose(`User does not have permission level ${levelData.name}`);
      return false;
    }
  }
}

module.exports = PermissionsService;
