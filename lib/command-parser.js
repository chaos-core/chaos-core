const { InvalidPrefixError } = require("./errors");
const CommandContext = require('./models/command-context');
const CommandFlag = require('./models/command-flag');

const FLAG_REGEX = /^--(\w+)$|^-(\w)$/;
const PARAM_REGEX = /{[\s\S]*?}|"[\s\S]*?[^\\]"|'[\s\S]*?[^\\]'|\S+/;

class CommandParser {
  static async parse(chaos, message, validPrefixes) {
    let {commandName, paramsString} = this.processMessage(message, validPrefixes);
    let command = chaos.commandManager.getCommand(commandName);
    let {args, flags} = await this.processParams(command, paramsString);

    return new CommandContext(message, command, args, flags);
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

    return { commandName, paramsString };
  }

  static getCommandName(message, validPrefixes) {
    return this.processMessage(message, validPrefixes).commandName;
  }

  static getParamsString(message, validPrefixes) {
    return this.processMessage(message, validPrefixes).paramsString;
  }

  static async processParams(command, paramsString) {
    let parsedParams = {args: {}, flags: {}};

    if (command.sanitizeArgs) {
      paramsString = this.sanitize(paramsString);
    }

    this._setDefaults(command, parsedParams);
    await this._parseParams(command, parsedParams, paramsString);

    return parsedParams;
  }

  static _setDefaults(command, parsedParams) {
    command.args.forEach((arg) => {
      parsedParams.args[arg.name] = arg.default;
    });

    command.allFlags.forEach((flag) => {
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

    if (paramsString[0] === "{") {
      //next param value is a json string
      let currLevel = 0;
      let value = "";

      for (let char of paramsString) {
        if (char === "{") { currLevel += 1; }
        if (char === "}") { currLevel -= 1; }
        value += char;
        if (currLevel === 0) { break; }
      }

      return value;
    }

    let paramsRegex = /"[\s\S]*?[^\\]"|'[\s\S]*?[^\\]'|\S+/;
    return paramsString.match(paramsRegex)[0];
  }

  static async _parseParams(command, parsedParams, paramsString) {
    let curFlag = null;
    let curArgIndex = 0;
    let curValue;

    // eslint-disable-next-line no-cond-assign
    while (curValue = this.nextParamValue(paramsString)) {
      let value = this.escapeParamValue(curValue);

      let valueIsFlag = this._paramValueIsFlag(value);

      if (curFlag && !valueIsFlag) {
        switch (curFlag.type) {
          case 'int':
            parsedParams.flags[curFlag.name] = Number.parseInt(value);
            break;
          case 'float':
            parsedParams.flags[curFlag.name] = Number.parseFloat(value);
            break;
          default:
            parsedParams.flags[curFlag.name] = value;
        }
        curFlag = null;
      } else if (valueIsFlag) {
        let flag = this._getFlag(command, value);

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
        let arg = command.args[curArgIndex];

        if (arg) {
          if (curArgIndex === command.args.length - 1 && arg.greedy) {
            //The last param is greedy, keep the rest of the param string
            parsedParams.args[arg.name] = this.escapeParamValue(paramsString);
            break;
          } else {
            parsedParams.args[arg.name] = value;
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
