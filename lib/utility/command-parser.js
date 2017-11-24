const FLAG_REGEX = /^--(\w+)$|^-(\w)$/;

class CommandParser {
  static getCommandName(message, prefix) {
    if (!message.content.startsWith(prefix)) {
      return undefined;
    }

    return message
      .content
      .split(' ')[0] //split into command and params
      .toLowerCase()
      .slice(prefix.length); //remove prefix
  }

  static getParams(command, message) {
    let paramsString = message.content.split(/ (.+)/)[1] || '';
    let params = {
      args: {},
      flags: {},
    };

    this._setDefaults(command, params);
    this._parseParams(command, params, paramsString);

    return params;
  }

  static _setDefaults(command, params) {
    command.args.forEach((arg) => {
      params.args[arg.name] = arg.default;
    });

    command.flags.forEach((flag) => {
      if(flag.type.toLowerCase() === 'boolean') {
        if (typeof flag.default === 'undefined') {
          params.flags[flag.name] = false;
        }
        else {
          params.flags[flag.name] = flag.default;
        }
      }
      else {
        params.flags[flag.name] = flag.default;
      }
    });
  }

  static _parseParams(command, params, paramsString) {
    let curFlagName = null;
    let curArgIndex = 0;
    let curValue;

    while (curValue = paramsString.match(/{.*}|".*?[^\\]"|'.*?[^\\]'|\S+/)) {
      let value = curValue[0]
        .replace(/^['"]|['"]$/g, '') //trim quotes at the beginning and end
        .replace(/\\'/g, '\'') //unescape escaped single quotes
        .replace(/\\"/g, '\"');//unescape escaped double quotes

      if (curFlagName) {
        params.flags[curFlagName] = value;
        curFlagName = null;
      }
      else {
        let flag = this._getFlag(command, value);
        if (flag) {
          if (flag.type.toLowerCase() === 'boolean') {
            // Flag is boolean, no data follows
            params.flags[flag.name] = true;
          }
          else {
            // Flag not boolean, next input is the flag data
            curFlagName = flag.name;
          }
        }
        else {
          let arg = command.args[curArgIndex];

          if (arg) {
            if (curArgIndex === command.args.length - 1 && arg.greedy) {
              params.args[arg.name] = paramsString;
              break;
            }
            else {
              params.args[arg.name] = value;
              curArgIndex++;
            }
          }
        }
      }

      paramsString = paramsString.replace(curValue[0], '').trim();
    }
  }

  static _getFlag(command, param) {
    let matches = param.match(FLAG_REGEX) || [];
    let flagName = matches[1];
    let flagAlias = matches[2];

    if (flagName) {
      return command.flags.find((f) => f.name.toLowerCase() === flagName.toLowerCase());
    }
    else if (flagAlias) {
      return command.flags.find((f) => f.shortAlias === flagAlias);
    }
    else {
      return null;
    }
  }
}

module.exports = CommandParser;