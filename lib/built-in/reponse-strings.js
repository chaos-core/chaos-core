const defaultResponseStrings = {
  config: {
    moduleList: (locals) =>
      `Here's a list of all enabled config modules:`,
    moduleNotFound: (locals) =>
      `There is no config module called "${locals.module}".`,
    actionNotFound: (locals) =>
      `There is no config action called "${locals.action}".`,
  },
  commandParsing: {
    help: (locals) =>
      "Here's how to use that command:",
    error: {
      missingArgument: (locals) =>
        "I'm sorry, but I'm missing some information for that command:",
      wrongScope: {
        generic: (locals) =>
          "I'm sorry, but that command isn't available here.",
        textChannelOnly: (locals) =>
          "I'm sorry, but that command can only be used from a server.",
      },
    },
  },
  commandRun: {
    unhandledException: {
      forOwner: (locals) =>
        "I ran into an unhandled exception: ",
      forUser: (locals) =>
        `I'm sorry, but there was an unexpected problem while I was working on that command. ` +
        `I have notified my owner, ${locals.owner.username}, about it and hopefully they will ` +
        `be able to fix it.`,
    },
  },
};

module.exports = defaultResponseStrings;
