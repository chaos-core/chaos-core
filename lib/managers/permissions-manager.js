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

  addUser(level, user) {

  }

  removeUser(level, user) {

  }

  addRole(level, role) {

  }

  removeRole(level, role) {

  }
}

PermissionsManager.PERMISIONS_KEYWORD = PERMISSIONS_KEYWORD;

module.exports = PermissionsManager;
