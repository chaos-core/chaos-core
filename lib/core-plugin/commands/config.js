const Discord = require('discord.js');

const Command = require("../../models/command");
const { PluginNotEnabledError } = require("../../errors");
const { asPromise } = require('../../utility');

class ConfigCommand extends Command {
  name = 'config';
  description = 'Edit or view settings for this guild';
  adminOnly = true;

  flags = [
    {
      name: 'list',
      shortAlias: 'l',
      description: "List all available plugins and actions",
      type: 'boolean',
      default: false,
    },
  ];

  args = [
    {
      name: 'plugin',
      description: 'the plugin to configure',
      required: true,
    },
    {
      name: 'action',
      description: 'the config action to perform',
      required: true,
    },
    ...['input1', 'input2', 'input3', 'input4', 'input5'].map((name) => ({
      name: name,
      showInHelp: false,
      required: false,
    })),
  ];

  constructor(chaos) {
    super(chaos);

    this.chaos.on('chaos.listen:before', () => {
      this.commandService = this.getService('core', 'CommandService');
      this.pluginService = this.getService('core', 'PluginService');
    });
  }

  get strings() {
    return this.chaos.strings.core.commands.config;
  }

  checkMissingArgs(context) {
    if (context.flags["list"]) {
      return false;
    } else {
      return this.requiredArgs.some((arg) => typeof context.args[arg.name] === 'undefined');
    }
  }

  async run(context, response) {
    let pluginName = context.args.plugin;
    let actionName = context.args.action;
    let prefix = this.commandService.getPrefixForChannel(context.channel);

    try {
      if (context.flags.list) {
        await this.listActions(context, response);
      } else {
        await this.runAction(context, response);
      }
    } catch (error) {
      switch (error.name) {
        case "PluginNotFoundError":
          return response.send({
            type: 'message',
            content: this.strings.pluginNotFound({
              pluginName,
              prefix,
            }),
          });
        case "PluginNotEnabledError":
          return response.send({
            type: 'message',
            content: this.strings.pluginNotEnabled({
              pluginName,
              prefix,
            }),
          });
        case "ConfigActionNotFoundError":
          return response.send({
            type: 'message',
            content: this.strings.actionNotFound({
              pluginName,
              actionName,
              prefix,
            }),
          });
        default:
          throw error;
      }
    }
  }

  async runAction(context, response) {
    const chaos = this.chaos;
    let guild = context.guild;
    let plugin = chaos.getPlugin(context.args.plugin);

    let pluginEnabled = await this.pluginService.isPluginEnabled(guild.id, plugin.name);
    if (!pluginEnabled) {
      throw new PluginNotEnabledError(`The plugin ${plugin.name} is not enabled.`);
    }

    let action = chaos.getConfigAction(plugin.name, context.args.action);
    let result = await asPromise(action.execAction(context));
    if (result && result.content) {
      await response.send(result);
    }
  }

  async listActions(context, response) {
    let pluginName = context.args.plugin;

    response.type = 'embed';

    if (pluginName) {
      response.content = this.strings.actionList({ pluginName });
      response.embed = this.actionListEmbed(context);
    } else {
      response.content = this.strings.pluginList({});
      response.embed = this.pluginListEmbed(context);
    }

    await response.send();
  }

  pluginListEmbed(context) {
    let prefix = this.commandService.getPrefixForChannel(context.channel);
    let embed = new Discord.RichEmbed();
    embed.setDescription(`For more info: ${prefix}config \`plugin\` --list`);

    const actionLists = {};
    Object.values(this.chaos.configManager.actions).forEach((action) => {
      const plugin = this.pluginService.getPlugin(action.pluginName);
      if (!actionLists[plugin.name]) {
        actionLists[plugin.name] = [action.name];
      } else {
        actionLists[plugin.name].push(action.name);
      }
    });

    const pluginList = this.pluginService.plugins;
    Object.values(pluginList).forEach((plugin) => {
      let actionList = actionLists[plugin.name] || [];
      if (actionList.length >= 1) {
        embed.addField(plugin.name, actionList.join(', '));
      }
    });

    return embed;
  }

  actionListEmbed(context) {
    const pluginName = context.args.plugin;
    const prefix = this.commandService.getPrefixForChannel(context.channel);
    const embed = new Discord.RichEmbed();

    const configActions = Object.values(this.chaos.configManager.actions)
      .filter((action) => action.pluginName.toLowerCase() === pluginName.toLowerCase());

    configActions.forEach((action) => {
      let usage = `${prefix}config ${action.pluginName} ${action.name}`;
      let description = action.description;
      let args = [];

      if (typeof action.args !== 'undefined') {
        action.args.forEach((arg) => {
          usage += arg.required ? ` \`${arg.name}\`` : ` \`(${arg.name})\``;

          let argLine = `\`${arg.name}\``;
          if (!arg.required) {
            argLine += ' (optional)';
          }
          if (arg.description) {
            argLine += `: ${arg.description}`;
          }
          args.push(argLine);
        });
      }

      let fieldValues = [];
      if (description) {
        fieldValues.push(`*Description*:\n\t${description}`);
      }

      fieldValues.push(`*Usage*:\n\t${usage}`);

      if (args.length >= 1) {
        fieldValues.push(`*Args*:\n\t${args.join('\n\t')}`);
      }

      embed.addField(action.name, fieldValues.join('\n'));
    });

    return embed;
  }
}

module.exports = ConfigCommand;
