const ConfigAction = require("../../../models/config-action");
const { ChaosError } = require("../../../errors");

class GrantRoleAction extends ConfigAction {
  name = 'grantRole';
  description = 'Add a role to a permission level.';

  args = [
    {
      name: 'role',
      description: 'the name or mention of the role to add',
      required: true,
    },
    {
      name: 'level',
      description: 'the permission level to add',
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
    return this.chaos.strings.core.configActions.permissions.grantRole;
  }

  async run(context) {
    let guild = context.guild;

    let roleString = context.args.role;
    let level = context.args.level;

    try {
      let role = await this.roleService.findRole(context.guild, roleString);
      await this.permissionsService.addRole(guild, level, role);
      return {
        status: 200,
        content: this.strings.addedRoleToLevel({ roleName: role.name, levelName: level }),
      };
    } catch (error) {
      switch (true) {
        case error instanceof ChaosError:
          return { status: 400, content: error.message };
        default:
          throw error;
      }
    }
  }
}

module.exports = GrantRoleAction;
