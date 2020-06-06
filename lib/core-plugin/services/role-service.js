const Service = require('../../models/service');
const { RoleNotFoundError } = require("../../errors");

const ID_REGEX = /<@&?(\d+)>|^(\d+)$/;

class RoleService extends Service {
  /**
   * Attempt to find a role in a guild by a roleString.
   *
   * The user string can be one of the following:
   * - a role mention: "<@^123132312412>"
   * - a role id: "131231243142"
   * - a role name: "exampleRole"
   *
   * @param guild {Guild}
   * @param roleString {String}
   *
   * @return {Promise<Role>}
   */
  async findRole(guild, roleString) {
    const roleIdMatches = roleString.match(ID_REGEX);

    let role;
    if (roleIdMatches !== null) {
      const roleId = roleIdMatches[1] || roleIdMatches[2];
      role = guild.roles.find((role) => role.id === roleId);
    } else {
      role = guild.roles.find((role) => role.name.toLowerCase() === roleString.toLowerCase());
    }

    if (!role) {
      throw new RoleNotFoundError(`The role '${roleString}' could not be found`);
    }

    return role;
  }
}

module.exports = RoleService;
