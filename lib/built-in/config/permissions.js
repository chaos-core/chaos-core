const PermissionsManager = require('./../../managers/permissions-manager');

module.exports = {
  name: 'permissions',
  actions: {
    'addUser': (context, response) => {
      let guild = context.guild;
      let userString = context.args.input1;
      let level = context.args.input2;

      let user = findUser(userString, context);
      if (!user) {
        response.content = `User ${userString} could not be found.`;
        return response.send();
      }

      return context.nix.permissionsManager
        .addUser(guild, level, user)
        .map((saved) => {
          if (saved) {
            response.content = `Added ${user} to ${level}`;
          }
          else {
            response.content = `Unable to update permissions`;
          }

          return response.send();
        })
        .catch((error) => {
          if (error.message === PermissionsManager.ERR_LEVEL_NOT_FOUND) {
            response.content = `Permission level ${level} is not available.`;
            return response.send();
          }
          else if (error.message === PermissionsManager.ERR_HAS_PERMISSION) {
            response.content = `${user} already has ${level}`;
            return response.send();
          }

          throw error;
        });
    },

    'rmUser': (context, response) => {
      let guild = context.guild;
      let userString = context.args.input1;
      let level = context.args.input2;

      let user = findUser(userString, context);
      if (!user) {
        response.content = `User ${userString} could not be found.`;
        return response.send();
      }

      return context.nix.permissionsManager
        .removeUser(guild, level, user)
        .map((saved) => {
          if (saved) {
            response.content = `Removed ${user} from ${level}`;
          }
          else {
            response.content = `Unable to update permissions`;
          }

          return response.send();
        })
        .catch((error) => {
          if (error.message === PermissionsManager.ERR_LEVEL_NOT_FOUND) {
            response.content = `Level ${level} is not available.`;
            return response.send();
          }
          else if (error.message === PermissionsManager.ERR_MISSING_PERMISSION) {
            response.content = `${user} is not in ${level}`;
            return response.send();
          }

          throw error;
        });
    },

    'addRole': (context, response) => {
      let guild = context.guild;
      let roleString = context.args.input1;
      let level = context.args.input2;

      let role = findRole(roleString, context);
      if (!role) {
        response.content = `Role ${roleString} could not be found.`;
        return response.send();
      }

      return context.nix.permissionsManager
        .addRole(guild, level, role)
        .map((saved) => {
          if (saved) {
            response.content = `Added ${role} to ${level}`;
          }
          else {
            response.content = `Unable to update permissions`;
          }

          return response.send();
        })
        .catch((error) => {
          if (error.message === PermissionsManager.ERR_LEVEL_NOT_FOUND) {
            response.content = `Level ${level} is not available.`;
            return response.send();
          }
          else if (error.message === PermissionsManager.ERR_HAS_PERMISSION) {
            response.content = `${role} already has ${level}`;
            return response.send();
          }

          throw error;
        });
    },

    'rmRole': (context, response) => {
      let guild = context.guild;
      let roleString = context.args.input1;
      let level = context.args.input2;

      let role = findRole(roleString, context);
      if (!role) {
        response.content = `Role ${roleString} could not be found.`;
        return response.send();
      }

      return context.nix.permissionsManager
        .removeRole(guild, level, role)
        .map((saved) => {
          if (saved) {
            response.content = `Removed ${role} from ${level}`;
          }
          else {
            response.content = `Unable to update permissions`;
          }

          return response.send();
        })
        .catch((error) => {
          if (error.message === PermissionsManager.ERR_LEVEL_NOT_FOUND) {
            response.content = `Level ${level} is not available.`;
            return response.send();
          }
          else if (error.message === PermissionsManager.ERR_MISSING_PERMISSION) {
            response.content = `${role} is not in ${level}`;
            return response.send();
          }

          throw error;
        });
    },
  },
};


function findUser(userString, context) {
  return context.guild.members.find((u) => u.toString() === userString);
}

function findRole(roleString, context) {
  return context.guild.roles.find((role) => {
    if (role.toString() === roleString) { return true; }
    if (role.name.toLowerCase() === roleString.toLowerCase()) { return true; }
    if (role.name.toLowerCase() === roleString.toLowerCase().replace(/^@/, '')) { return true; }
    return false;
  });
}
