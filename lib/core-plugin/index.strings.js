module.exports = {
  core: {
    commands: {
      owner: {
        listGuilds: {
          inGuilds: () =>
            `I'm in the following guilds:`,
        },
        shutdown: {
          shuttingDown: () =>
            `Ok, shutting down now.`,
        },
      },
      config: {
        pluginList: () =>
          `Here's a list of plugins with config actions:`,
        actionList: ({ pluginName }) =>
          `Here's a list of config actions for ${pluginName}:`,
        pluginNotFound: ({ pluginName, prefix }) =>
          `There is no plugin "${pluginName}".\n` +
          `You can use \`${prefix}config --list\` to see a list of all config ` +
          `actions.`,
        pluginNotEnabled: ({ pluginName, prefix }) =>
          `The plugin "${pluginName}" is currently disabled.\n` +
          `You can use \`${prefix}config core enablePlugin ${pluginName}\` to ` +
          `enable it.`,
        actionNotFound: ({ pluginName, actionName, prefix }) =>
          `There is no config action "${pluginName} ${actionName}".\n` +
          `You can use \`${prefix}config ${pluginName} --list\` to see a list ` +
          `of all config actions.`,
      },
      help: {
        whatICanDo: ({ helpFlag }) =>
          `Here's everything that I can do for you.\n` +
          `If you want more help on a specific command, add '${helpFlag}' to ` +
          `the command`,
        checkYourDms: () =>
          `Check your DMs for the command list.`,
      },
    },
    configActions: {
      commands: {
        cmdEnabled: {
          isEnabled: ({ commandName }) =>
            `Command \`${commandName}\` is enabled.`,
          isDisabled: ({ commandName }) =>
            `Command \`${commandName}\` is disabled.`,
        },
        disableCmd: {
          hasBeenDisabled: ({ commandName }) =>
            `Command \`${commandName}\` has been disabled.`,
          unableToDisable: ({ commandName }) =>
            `Unable to disable \`${commandName}\`.`,
        },
        enableCmd: {
          hasBeenEnabled: ({ commandName }) =>
            `Command \`${commandName}\` has been enabled.`,
          unableToEnable: ({ commandName }) =>
            `Unable to enable \`${commandName}\`.`,
        },
        listCmds: {
          availableCommands: () =>
            `Here are all my available commands:`,
          enabledCommands: () =>
            `Enabled Commands:`,
          disabledCommands: () =>
            `Disabled Commands:`,
        },
      },
      permissions: {
        grantRole: {
          addedRoleToLevel: ({ roleName, levelName }) =>
            `Added \`${roleName}\` to \`${levelName}\`.`,
        },
        grantUser: {
          addedUserToLevel: ({ userName, levelName }) =>
            `Added \`${userName}\` to \`${levelName}\`.`,
        },
        listPerms: {
          availablePermissions: () =>
            `Here are the available permission levels:`,
        },
        revokeRole: {
          removedRoleFromLevel: ({ roleName, levelName }) =>
            `Removed \`${roleName}\` from \`${levelName}\`.`,
        },
        revokeUser: {
          removedUserFromLevel: ({ userName, levelName }) =>
            `Removed \`${userName}\` from \`${levelName}\`.`,
        },
      },
      plugins: {
        disablePlugin: {
          pluginDisabled: ({ pluginName }) =>
            `The plugin ${pluginName} is now disabled.`,
        },
        enablePlugin: {
          pluginEnabled: ({ pluginName }) =>
            `The plugin ${pluginName} is now enabled.`,
        },
        listPlugins: {
          allPlugins: () =>
            `Here are all my current plugins:`,
        },
      },
      setPrefix: {
        prefixChanged: ({ newPrefix }) =>
          `${newPrefix} is now the command prefix.`,
      },
    },
  },
};
