module.exports = {
  name: 'config',
  description: 'Edit core config settings',
  scope: 'text',
  adminOnly: true,
  showInHelp: false,
  enabledByDefault: true,

  flags: [
    {
      name: 'list',
      shortAlias: 'l',
      description: "List all available modules and actions",
      type: 'boolean',
      default: false,
    },
  ],

  args: [
    {
      name: 'module',
      description: 'the module to configure',
      required: true,
    },
    {
      name: 'action',
      description: 'the config action to perform',
      required: true,
    },
    {
      name: 'input1',
      description: 'input value',
      showInHelp: false,
      required: false,
    },
    {
      name: 'input2',
      description: 'input value',
      showInHelp: false,
      required: false,
    },
    {
      name: 'input3',
      description: 'input value',
      showInHelp: false,
      required: false,
    },
    {
      name: 'input4',
      description: 'input value',
      showInHelp: false,
      required: false,
    },
    {
      name: 'input5',
      description: 'input value',
      showInHelp: false,
      required: false,
    },
  ],

  run(context, response) {
    let moduleName = context.args.module;
    let module = context.nix.configManager.getModule(moduleName);
    if (!module) {
      response.type = 'embed';
      response.content = context.nix.responseStrings.config.moduleNotFound({module: moduleName});
      response.embed = moduleListEmbed(context);
      return response.send();
    }

    let actionName = context.args.action;
    let action = module[actionName];
    if (!action) {
      response.type = 'embed';
      response.content = context.nix.responseStrings.config.actionNotFound({action: actionName, module: moduleName});
      response.embed = moduleListEmbed(context);
      return response.send();
    }

    return action(context, response);
  },
};

function moduleListEmbed(context) {
  let embed = {
    fields: [],
  };

  let modules = context.nix.configManager.modules;
  for (let moduleName in modules) {
    // skip loop if the property is from prototype
    if (!modules.hasOwnProperty(moduleName)) continue;

    let module = modules[moduleName];
    embed.fields.push({
      name: moduleName,
      value: "*Actions:* " + Object.keys(module).join(', '),
    });
  }

  return embed;
};

