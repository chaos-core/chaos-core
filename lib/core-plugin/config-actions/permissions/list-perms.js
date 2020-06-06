const Discord = require('discord.js');

const ConfigAction = require("../../../models/config-action");

class ListPermissionsAction extends ConfigAction {
  name = 'listPerms';
  description = 'list available permission levels';

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.permissionsService = this.getService('core', 'permissionsService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.permissions.listPerms;
  }

  async run(context) {
    let embed = new Discord.RichEmbed();
    embed.addField("Bot Owner\\*", this.chaos.owner.tag);
    embed.addField("Guild Owner\\*", context.guild.owner.user.tag);
    embed.setFooter('* bypasses permissions');

    const allLevelData = [];
    for (const levelName of this.chaos.permissionsManager.levels) {
      const levelData = await this.permissionsService.getPermissionsData(context.guild.id, levelName);
      const members = levelData.users
        .map((id) => context.guild.members.get(id))
        .map((member) => member.user.tag);
      const roles = levelData.roles
        .map((id) => context.guild.roles.get(id))
        .map((role) => role.name);
      allLevelData.push([
        levelName,
        members.length > 0 ? members : ['[None]'],
        roles.length > 0 ? roles : ['[None]'],
      ]);
    }

    allLevelData
      .sort(([levelNameA], [levelNameB]) => (levelNameA > levelNameB) ? 1 : -1)
      .map(([levelName, users, roles]) => {
        embed.addField(
          levelName,
          `*Users*: ${users.join(', ')}\n*Roles*: ${roles.join(', ')}`);
      });

    return {
      status: 200,
      content: this.strings.availablePermissions(),
      embed: embed,
    };
  }
}

module.exports = ListPermissionsAction;
