const ConfigAction = require("../../../models/config-action");

class ListCommandsAction extends ConfigAction {
  name = 'listCmds';
  description = 'list all commands from all plugins';

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen', () => {
      this.commandService = this.getService('core', 'commandService');
      this.pluginService = this.getService('core', 'pluginService');
    });
  }

  get strings() {
    return this.chaos.strings.core.configActions.commands.listCmds;
  }

  async run(context) {
    let commandData = await Promise.all(
      this.chaos.commandManager.commands.map(async (command) => {
        try {
          let cmdEnabled = await this.commandService.isCommandEnabled(context.guild.id, command.name);
          return [command, cmdEnabled, true];
        } catch (error) {
          if (error.name === `PluginDisabledError`) {
            return [command, false, false];
          } else {
            throw error;
          }
        }
      }),
    );

    let enabledCmds = {};
    let disabledCmds = {};

    commandData.forEach(([command, cmdEnabled, pluginEnabled]) => {
      if (cmdEnabled) {
        if (!enabledCmds[command.pluginName]) {
          enabledCmds[command.pluginName] = [];
        }

        enabledCmds[command.pluginName].push(`\`${command.name}\`\n- ${command.description}`);
      } else {
        if (!disabledCmds[command.pluginName]) {
          disabledCmds[command.pluginName] = [];
        }

        let reasons = [];
        if (!pluginEnabled) {
          reasons.push(`plugin '${command.pluginName}' disabled`);
        } else if (!cmdEnabled) {
          reasons.push(`explicitly disabled`);
        }

        disabledCmds[command.pluginName].push(`\`${command.name}\` - ${reasons.join(' | ')}\n- ${command.description}`);
      }
    });

    let embed = {
      fields: [],
    };

    if (Object.keys(enabledCmds).length > 0) {
      let enabledCmdList = [];
      Object.entries(enabledCmds).forEach(([pluginName, commands]) => {
        enabledCmdList.push(`**== ${pluginName} ==**\n${commands.join('\n')}`);
      });

      embed.fields.push({
        name: this.strings.enabledCommands(),
        value: enabledCmdList.join('\n'),
      });
    }

    if (Object.keys(disabledCmds).length > 0) {
      let disabledCmdList = [];
      Object.entries(disabledCmds).forEach(([pluginName, commands]) => {
        disabledCmdList.push(`**== ${pluginName} ==**\n${commands.join('\n')}`);
      });

      embed.fields.push({
        name: this.strings.disabledCommands(),
        value: disabledCmdList.join('\n'),
      });
    }

    return {
      status: 200,
      content: this.strings.availableCommands(),
      embed: embed,
    };
  }
}

module.exports = ListCommandsAction;
