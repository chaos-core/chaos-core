const {InvalidPrefixError} = require('./errors');
const CommandContext = require('./models/command-context');
const CommandArg = require('./models/command-arg');
const CommandFlag = require('./models/command-flag');

const FLAG_REGEX = /^--(\w+)$|^-(\w)$/;
const PARAM_REGEX = /{[\s\S]*?}|"[\s\S]*?[^\\]"|'[\s\S]*?[^\\]'|\S+/;

class CommandParser {
  static async parse(chaos, message, validPrefixes) {
    const {commandName, paramsString} = this.processMessage(message, validPrefixes);
    const command = chaos.commandManager.getCommand(commandName);
    const context = new CommandContext(message, command);

    let {args, flags} = await this.processParams(context, paramsString);
    context.args = args;
    context.flags = flags;
    return context;
  }

  static isCommand(message, validPrefixes) {
    // is command if the message starts with one of the prefixes;
    return validPrefixes.some((prefix) => message.content.startsWith(prefix));
  }

  static processMessage(message, validPrefixes) {
    let prefix = validPrefixes.find((prefix) => message.content.startsWith(prefix));
    if (!prefix) {
      throw new InvalidPrefixError();
    }

    let [commandName, paramsString] =
      message.content
        .slice(prefix.length) //remove prefix
        .split(/ (.+)/); //split on first space

    if (!paramsString) { paramsString = ''; }

    return {commandName, paramsString};
  }

  static getCommandName(message, validPrefixes) {
    return this.processMessage(message, validPrefixes).commandName;
  }

  static getParamsString(message, validPrefixes) {
    return this.processMessage(message, validPrefixes).paramsString;
  }

  static async processParams(context, paramsString) {
    let parsedParams = {args: {}, flags: {}};

    if (context.command.sanitizeArgs) {
      paramsString = this.sanitize(paramsString);
    }

    this._setDefaults(context, parsedParams);
    await this._parseParams(context, parsedParams, paramsString);

    return parsedParams;
  }

  static _setDefaults(context, parsedParams) {
    context.command.args.forEach((arg) => {
      parsedParams.args[arg.name] = arg.default;
    });

    context.command.allFlags.forEach((flag) => {
      if (flag.type.toLowerCase() === 'boolean') {
        if (typeof flag.default === 'undefined') {
          parsedParams.flags[flag.name] = false;
        } else {
          parsedParams.flags[flag.name] = flag.default;
        }
      } else {
        parsedParams.flags[flag.name] = flag.default;
      }
    });
  }

  static escapeParamValue(paramValue) {
    if (paramValue[0].match(/["']/) && paramValue[paramValue.length - 1].match(/["']/)) {
      return paramValue
        .replace(/^['"]|['"]$/g, '') //trim quotes at the beginning and end
        .replace(/\\'/g, `'`) //unescape escaped single quotes
        .replace(/\\"/g, `"`);//unescape escaped double quotes
    } else {
      return paramValue;
    }
  }

  static nextParamValue(paramsString) {
    paramsString = paramsString.trim();

    if (paramsString.length === 0) {
      return undefined;
    }

    if (paramsString[0] === '{') {
      //next param value is a json string
      let currLevel = 0;
      let value = '';

      for (let char of paramsString) {
        if (char === '{') { currLevel += 1; }
        if (char === '}') { currLevel -= 1; }
        value += char;
        if (currLevel === 0) { break; }
      }

      return value;
    }

    let paramsRegex = /"[\s\S]*?[^\\]"|'[\s\S]*?[^\\]'|\S+/;
    return paramsString.match(paramsRegex)[0];
  }

  static async _parseParams(context, parsedParams, paramsString) {
    let curFlag = null;
    let curArgIndex = 0;
    let curValue;

    // eslint-disable-next-line no-cond-assign
    while (curValue = this.nextParamValue(paramsString)) {
      let value = this.escapeParamValue(curValue);

      let valueIsFlag = this._paramValueIsFlag(value);

      if (curFlag && !valueIsFlag) {
        parsedParams.flags[curFlag.name] = await CommandFlag.resolve(context, curFlag, value);
        curFlag = null;
      } else if (valueIsFlag) {
        const flag = this._getFlag(context.command, value);

        if (!flag) {
          // Flag not defined, move to next input
          break;
        } else if (flag.type.toLowerCase() === CommandFlag.TYPES.boolean) {
          // Flag is boolean, no data follows
          parsedParams.flags[flag.name] = true;
          break;
        } else {
          // Flag not boolean, next input is the flag data
          curFlag = flag;
        }
      } else {
        let arg = context.command.args[curArgIndex];

        if (arg) {
          if (curArgIndex === context.command.args.length - 1 && arg.greedy) {
            //The last param is greedy, use the rest of the param string
            parsedParams.args[arg.name] = await CommandArg.resolve(context, arg, this.escapeParamValue(paramsString));
            break;
          } else {
            parsedParams.args[arg.name] = await CommandArg.resolve(context, arg, value);
            curArgIndex++;
          }
        }
      }

      paramsString = paramsString.replace(curValue, '').trim();
    }
  }

  static _paramValueIsFlag(param) {
    let matches = param.match(FLAG_REGEX) || [];
    return matches.length >= 1;
  }

  static _getFlag(command, param) {
    let matches = param.match(FLAG_REGEX) || [];
    let flagName = matches[1];
    let flagAlias = matches[2];

    if (flagName) {
      return command.allFlags.find((f) => f.name.toLowerCase() === flagName.toLowerCase());
    } else if (flagAlias) {
      return command.allFlags.find((f) => f.shortAlias === flagAlias);
    } else {
      return null;
    }
  }

  static sanitize(value) {
    return value
      .replace(/@+everyone/g, 'everyone')
      .replace(/@+here/g, 'here');
  }
}

CommandParser.FLAG_REGEX = FLAG_REGEX;
CommandParser.PARAM_REGEX = PARAM_REGEX;

module.exports = CommandParser;
