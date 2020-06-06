const ConfigAction = require("../../../models/config-action");
const { ChaosError } = require("../../../errors");

class GrantUserAction extends ConfigAction {
  name = 'grantUser';
  description = 'Add a user to a permission level.';

  args = [
    {
      name: "user",
      description: "the user to add",
      required: true,
    },
    {
      name: "level",
      description: "the permission level to add",
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
    return this.chaos.strings.core.configActions.permissions.grantUser;
  }

  async run(context) {
    let guild = context.guild;
    let userString = context.args.user;
    let level = context.args.level;

    try {
      let member = await this.userService.findMember(guild, userString);
      await this.permissionsService.addUser(guild, level, member.user);
      return {
        status: 200,
        content: this.strings.addedUserToLevel({ userName: member.user.username, levelName: level }),
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

module.exports = GrantUserAction;
