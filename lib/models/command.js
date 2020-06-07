const ChaosComponent = require('./chaos-component');
const CommandArg = require('./command-arg');
const CommandFlag = require('./command-flag');
const {InvalidComponentError} = require('../errors');

class Command extends ChaosComponent {
  pluginName = null;
  name = null;
  description = null;

  permissions = [];
  ownerOnly = false;
  adminOnly = false;
  showInHelp = true;

  flags = [];
  args = [];

  sanitizeArgs = true;

  constructor(chaos, options = {}) {
    super(chaos);
    delete options.chaos; // Make sure the chaos property isn't overwritten.
    Object.assign(this, options);

    this.args = this.args.map((arg) => new CommandArg(arg));
    this.flags = this.flags.map((flag) => new CommandFlag(flag));
  }

  /*
   * Get a list of all flags for the command including system flags like 'help'
   */
  get allFlags() {
    return [
      ...this.flags,
      CommandFlag.helpFlag,
    ];
  }

  get requiredArgs() {
    return this.args.filter((arg) => arg.required);
  }

  validate() {
    if (typeof this.name !== "string") {
      throw new InvalidComponentError("Name for command is missing.");
    }
  }

  checkHasHelpFlag(context) {
    return context.flags['help'] === true;
  }

  checkMissingArgs(context) {
    return this.requiredArgs.some((arg) => context.args[arg.name] === null);
  }

  execCommand(context, response) {
    if (this.checkHasHelpFlag(context)) {
      return this.help(context, response);
    } else if (this.checkMissingArgs(context)) {
      return this.argsMissing(context, response);
    } else {
      return this.run(context, response);
    }
  }

  run() {
    throw new Error("Command run function not implemented");
  }

  help(context, response) {
    response.type = 'embed';
    response.content = this.chaos.strings.commandParsing.help({});
    response.embed = this.helpEmbed();
    return response.send();
  }

  argsMissing(context, response) {
    response.type = 'embed';
    response.content = this.chaos.strings.commandParsing.error.missingArgument({});
    response.embed = this.helpEmbed();
    return response.send();
  }

  helpEmbed() {
    let usage = `!${this.name}`;
    let argsList = [];
    let flagsList = [];

    this.flags
      .filter((flag) => typeof flag.showInHelp === 'undefined' || flag.showInHelp === true)
      .forEach((flag) => {
        let namePart = '';
        let aliasPart = '';
        let descPart = '';

        if (flag.shortAlias) {
          aliasPart = `\`-${flag.shortAlias}\``;
        }

        if (flag.required) {
          usage += ` --${flag.name}`;
          namePart = `\`--${flag.name}\` ${aliasPart}`;
          descPart = flag.description;
        } else {
          usage += ` [--${flag.name}]`;
          namePart = `\`--${flag.name}\` ${aliasPart}`;
          descPart = `*(optional)* ${flag.description}`;
        }

        flagsList.push(`${namePart}: ${descPart}`);
      });

    this.args
      .filter((arg) => typeof arg.showInHelp === 'undefined' || arg.showInHelp === true)
      .forEach((arg) => {
        if (arg.required) {
          usage += ' <' + arg.name + '>';
          argsList.push(`\`${arg.name}\`: ${arg.description}`);
        } else {
          usage += ' [' + arg.name + ']';
          argsList.push(`\`${arg.name}\`: (optional) ${arg.description}`);
        }
      });

    let embed = {
      title: this.name,
      description: this.description || '\u200B',
      fields: [],
    };

    embed.fields.push({
      name: 'Usage',
      value: usage,
    });

    if (argsList.length >= 1) {
      embed.fields.push({
        name: 'Arguments',
        value: argsList.join('\n'),
      });
    }

    if (flagsList.length >= 1) {
      embed.fields.push({
        name: 'Flags',
        value: flagsList.join('\n'),
      });
    }

    return embed;
  }
}

module.exports = Command;
