const Rx = require('rx');

const PERMISSIONS_KEYWORD = 'core.permissions';
const ERR_LEVEL_NOT_FOUND = 'Level is not available';
const ERR_HAS_PERMISSION = 'Already has permission level';
const ERR_MISSING_PERMISSION = 'Does not have permission level';

const DEFAULT_PERMISSIONS = {
  'admin': {
    users: [],
    roles: [],
  },
  'mod': {
    users: [],
    roles: [],
  },
};

class PermissionsManager {
  constructor (dataManager) {
    this.dataManager = dataManager;
  }

  getPermissionsData(guildId) {
    return this.dataManager
      .getGuildData(guildId, PERMISSIONS_KEYWORD)
      .map((data) => !data ? DEFAULT_PERMISSIONS : data);
  }

  setPermissionsData(guildId, data) {
    return this.dataManager
      .setGuildData(guildId, PERMISSIONS_KEYWORD, data);
  }

  addUser(guild, level, user) {
    return this.getPermissionsData(guild.id)
      .flatMap((savedData) => {
        let levelData = savedData[level];
        if (!levelData) { throw new Error(ERR_LEVEL_NOT_FOUND); }

        let users = levelData.users;
        if (users.indexOf(user.id) !== -1) { throw new Error(ERR_HAS_PERMISSION); }

        users.push(user.id);

        return this.setPermissionsData(guild.id, savedData);
      })
      .map((savedData) => savedData[level].users.indexOf(user.id) !== -1);
  }

  removeUser(guild, level, user) {
    return this.getPermissionsData(guild.id)
      .flatMap((savedData) => {
        let levelData = savedData[level];
        if (!levelData) { throw new Error(ERR_LEVEL_NOT_FOUND); }

        let users = levelData.users;
        let index = users.indexOf(user.id);
        if (index === -1) { throw new Error(ERR_MISSING_PERMISSION); }

        users.splice(index, 1);

        return this.setPermissionsData(guild.id, savedData);
      })
      .map((savedData) => savedData[level].users.indexOf(user.id) === -1);
  }

  addRole(guild, level, role) {
    return this.getPermissionsData(guild.id)
      .flatMap((savedData) => {
        let levelData = savedData[level];
        if (!levelData) { throw new Error(ERR_LEVEL_NOT_FOUND); }

        let roles = levelData.roles;
        if (roles.indexOf(role.id) !== -1) { throw new Error(ERR_HAS_PERMISSION); }

        roles.push(role.id);

        return this.setPermissionsData(guild.id, savedData);
      })
      .map((savedData) => savedData[level].roles.indexOf(role.id) !== -1);
  }

  removeRole(guild, level, role) {
    return this.getPermissionsData(guild.id)
      .flatMap((savedData) => {
        let levelData = savedData[level];
        if (!levelData) { throw new Error(ERR_LEVEL_NOT_FOUND); }

        let roles = levelData.roles;
        let index = roles.indexOf(role.id);
        if (index === -1) { throw new Error(ERR_MISSING_PERMISSION); }

        roles.splice(index, 1);

        return this.setPermissionsData(guild.id, savedData);
      })
      .map((savedData) => {
        return savedData[level].roles.indexOf(role.id) === -1;
      });
  }

  hasPermission(command, context, response) {
    if (context.channel.type !== 'text') {
      // All commands have permission on non test channels
      return Rx.Observable.return(true);
    }

    if(context.member.id === context.nix.owner.id) {
      // Bot owner always has permission
      return Rx.Observable.return(true);
    }

    if (context.member.id === context.guild.ownerId) {
      // Guild owner always has permission
      return Rx.Observable.return(true);
    }

    let guildId = context.guild.id;

    return this.getPermissionsData(guildId)
      .map((savedData) => {
        let permLevels = command.permissions;
        if(permLevels.length === 0) {
          return true; // no specified permission levels, default to true
        }

        let allowedUsers = [];
        permLevels.forEach((level) => {
          allowedUsers = allowedUsers.concat(savedData[level].users);
        });
        if (allowedUsers.indexOf(context.member.id) !== -1) {
          return true;
        }

        let allowedRoles = [];
        permLevels.forEach((level) => {
          allowedRoles = allowedRoles.concat(savedData[level].roles);
        });
        if (context.member.roles.some((r) => allowedRoles.indexOf(r.id) !== -1)) {
          return true;
        }

        return false;
      });
  }

  filterHasPermission(command, context, response) {
    return this.hasPermission(command, context, response)
      .filter(Boolean);
  }
}

PermissionsManager.PERMISIONS_KEYWORD = PERMISSIONS_KEYWORD;
PermissionsManager.ERR_LEVEL_NOT_FOUND = ERR_LEVEL_NOT_FOUND;
PermissionsManager.ERR_HAS_PERMISSION = ERR_HAS_PERMISSION;
PermissionsManager.ERR_MISSING_PERMISSION = ERR_MISSING_PERMISSION;

module.exports = PermissionsManager;
