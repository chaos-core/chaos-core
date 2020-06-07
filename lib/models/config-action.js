const ChaosComponent = require('./chaos-component');

class ConfigAction extends ChaosComponent {
  name = null;
  pluginName = null;
  description = null;
  args = [];

  constructor(chaos, options) {
    super(chaos);
    Object.assign(this, options);
  }

  get requiredArgs() {
    return this.args.filter((input) => input.required);
  }

  execAction(context) {
    this.args.forEach((arg, index) => {
      if (typeof context.args[arg.name] === "undefined") {
        context.args[arg.name] = context.args[`input${index + 1}`];
      }
    });

    if (this.checkMissingArgs(context)) {
      return {
        status: 400,
        content: this.chaos.strings.commandParsing.error.missingArgument({}),
        embed: this.helpEmbed(),
      };
    } else {
      return this.run(context);
    }
  }

  run() {}

  checkMissingArgs(context) {
    return this.requiredArgs.some((arg) => typeof context.args[arg.name] === 'undefined');
  }

  helpEmbed() {
    let usageField = {
      name: 'Usage',
      value: `!config ${this.pluginName} ${this.name}`,
    };

    let argsList = [];

    this.args.forEach((arg) => {
      if (arg.required) {
        usageField.value += ' <' + arg.name + '>';
        argsList.push('**' + arg.name + '**: ' + arg.description);
      } else {
        usageField.value += ' [' + arg.name + ']';
        argsList.push('**' + arg.name + '** (optional): ' + arg.description);
      }
    });

    let embed = {
      title: this.name,
      description: this.description || '\u200B',
      fields: [usageField],
    };

    if (argsList.length >= 1) {
      embed.fields.push({
        name: 'Args',
        value: argsList.join('\n'),
      });
    }

    return embed;
  }
}

module.exports = ConfigAction;
