class CommandContext {
  constructor(message, command, args = {}, flags = {}) {
    this.message = message;
    this.command = command;

    this.args = args;
    this.flags = flags;
  }

  get guild() {
    return this.message.guild;
  }

  get author() {
    return this.message.author;
  }

  get member() {
    return this.message.member;
  }

  get channel() {
    return this.message.channel;
  }
}

module.exports = CommandContext;
