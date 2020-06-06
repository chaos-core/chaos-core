const { ChaosError } = require("../../../errors");
const ConfigAction = require("../../../models/config-action");

class RevokeUserAction extends ConfigAction {
  name = 'revokeUser';
  description = 'remove a user from a permission level';

  args = [
    {
      name: 'user',
      description: 'the user to remove',
      required: true,
    },
    {
      name: 'level',
      description: 'the permission level to remove',
      required: true,
    },
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.permissionsService = this.getService('core', 'permissionsService');
      this.userService = this.getService('core', 'userService');
    });
  }

  get strings() {
    return super.strings.core.configActions.permissions.revokeUser;
  }

  async run(context) {
    let guild = context.guild;
    let userString = context.args.user;
    let level = context.args.level;

    try {
      let user = await this.userService.findMember(guild, userString)
        .then((member) => member.user);
      await this.permissionsService.removeUser(guild, level, user);

      return {
        status: 200,
        content: this.strings.removedUserFromLevel({ userName: user.username, levelName: level }),
      };
    } catch (error) {
      if (error instanceof ChaosError) {
        return { status: 400, content: error.message };
      } else {
        throw error;
      }
    }
  }
}

module.exports = RevokeUserAction;
