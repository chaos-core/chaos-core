const Command = require('../../../../models/command');

class ShutdownCommand extends Command {
  name = 'owner:shutdown';
  description = 'Shutdown';
  ownerOnly = true;

  async run(context, response) {
    let strings = this.chaos.strings.core.commands.owner.shutdown;
    await response.send({ content: strings.shuttingDown() });
    await this.chaos.shutdown();
  }
}

module.exports = ShutdownCommand;
