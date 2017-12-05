const Rx = require('rx');

const PERMISSIONS_KEYWORD = 'core.permissions';
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
        let users = savedData[level].users;
        if (users.indexOf(user.id) !== -1) {
          throw new Error('User already has permission level');
        }
        users.push(user.id);

        return this.setPermissionsData(guild.id, savedData);
      });
  }

  removeUser(guild, level, user) {
    return this.getPermissionsData(guild.id)
      .flatMap((savedData) => {
        let users = savedData[level].users;
        let index = users.indexOf(user.id);

        if (index === -1) {
          throw new Error('User does not have permission level');
        }
        users.splice(index, 1);

        return this.setPermissionsData(guild.id, savedData);
      });
  }

  addRole(guild, level, role) {
    return this.getPermissionsData(guild.id)
      .map((savedData) => {
        let roles = savedData[level].roles;
        if (roles.indexOf(role.id) !== -1) {
          throw new Error('Role already has permission level');
        }
        roles.push(role.id);

        return this.setPermissionsData(guild.id, savedData);
      });
  }

  removeRole(guild, level, role) {
    return this.getPermissionsData(guild.id)
      .map((savedData) => {
        let roles = savedData[level].roles;
        let index = roles.indexOf(role.id);

        if (index === -1) {
          throw new Error('Role does not have permission level');
        }
        roles.splice(index, 1);

        return this.setPermissionsData(guild.id, savedData);
      });
  }

  hasPermission(command, context, response) {
    if (context.channel.type !== 'text') {
      // All commands have permission on non test channels
      return Rx.Observable.return(true);
    }

    if(context.member.id === context.nix.owner.id) {
      // Owner always has permission
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

module.exports = PermissionsManager;
