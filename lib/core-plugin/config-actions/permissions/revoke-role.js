const { ChaosError } = require("../../../errors");
const ConfigAction = require("../../../models/config-action");

class RevokeRoleAction extends ConfigAction {
  name = 'revokeRole';
  description = 'removes a role from a permission level';

  args = [
    {
      name: 'role',
      description: 'the name or mention of the role to remove',
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
      this.roleService = this.getService('core', 'roleService');
    });
  }

  get strings() {
    return super.strings.core.configActions.permissions.revokeRole;
  }

  async run(context) {
    let guild = context.guild;
    let roleString = context.args.role;
    let level = context.args.level;

    try {
      const role = await this.roleService.findRole(context.guild, roleString);
      await this.permissionsService.removeRole(guild, level, role);

      return {
        status: 200,
        content: this.strings.removedRoleFromLevel({ roleName: role.name, levelName: level }),
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

module.exports = RevokeRoleAction;
