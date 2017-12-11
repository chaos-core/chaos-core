const Rx = require('rx');

module.exports = {
  name: 'help',
  description: 'See all commands that I can do',
  scope: 'text',
  showInHelp: false,

  run (context, response) {
    let commandManager = context.nix.commandManager;

    response.type = 'embed';
    response.content = "Here's everything that I can do. If you want more help on a specific command, add '--help' to the command ";

    return Rx.Observable
      .from(Object.values(commandManager.commands))
      .filter((command) => !command.adminOnly)
      .filter((command) => command.showInHelp)
      .flatMap((command) =>
        commandManager
          .isCommandEnabled(context, command.name)
          .filter(Boolean)
          .map(() => command)
      )
      .map((command) => response.embed.addField(commandManager.commandPrefix + command.name, command.description))
      .toArray()
      .flatMap(() => response.send());
  },
};
