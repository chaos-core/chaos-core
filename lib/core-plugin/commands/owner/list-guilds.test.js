const createChaosStub = require('../../../test/create-chaos-stub');

describe('Command: !owner:listGuilds', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.command = this.chaos.getCommand('owner:listGuilds');
    this.message = this.chaos.createMessage();

    [
      { name: "guild1", id: "guildId-00001" },
      { name: "guild2", id: "guildId-00002" },
      { name: "guild3", id: "guildId-00003" },
    ].forEach((guild) => {
      this.chaos.discord.guilds.set(guild.id, guild);
    });

    await this.chaos.listen();
  });

  describe("!owner:listGuilds", function () {
    beforeEach(function () {
      this.message.content = "!owner:listGuilds";
    });

    context('when the user is not the bot owner', function () {
      it('does nothing', async function () {
        sinon.spy(this.command, 'run');

        let responses = await this.chaos.testMessage(this.message);
        expect(this.command.run).not.to.have.been.called;
        expect(responses).to.have.length(0);
      });
    });

    context('when the user is the bot owner', function () {
      beforeEach(function () {
        this.message.author.id = this.chaos.owner.id;
      });

      it('replies with a list of all guilds', async function () {
        sinon.spy(this.command, 'run');

        let responses = await this.chaos.testMessage(this.message);
        expect(this.command.run).to.have.been.called;
        expect(responses).to.have.length(1);
        expect(responses[0]).to.containSubset({
          content:
            "I'm in the following guilds:\n" +
            "- guild1 (guildId-00001)\n" +
            "- guild2 (guildId-00002)\n" +
            "- guild3 (guildId-00003)",
        });
      });
    });
  });
});
