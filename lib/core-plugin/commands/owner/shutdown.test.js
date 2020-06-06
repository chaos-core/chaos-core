const createChaosStub = require('../../../test/create-chaos-stub');

describe('Command: !owner:shutdown', function () {
  beforeEach(async function () {
    this.chaos = createChaosStub();
    this.command = this.chaos.getCommand('owner:shutdown');
    this.message = this.chaos.createMessage();

    await this.chaos.listen();
  });

  afterEach(async function () {
    if (this.chaos.listening) {
      await this.chaos.shutdown();
    }
  });

  describe("!owner:shutdown", function () {
    beforeEach(function () {
      this.message.content = '!owner:shutdown';
    });

    context('when the user is not the bot owner', function () {
      it('does nothing', async function () {
        sinon.spy(this.command, 'run');
        sinon.spy(this.chaos, 'shutdown');

        let responses = await this.chaos.testMessage(this.message);

        expect(this.command.run).not.to.have.been.called;
        expect(this.chaos.shutdown).not.to.have.been.called;
        expect(responses).to.have.length(0);
      });
    });

    context('when the user is the bot owner', function () {
      beforeEach(function () {
        this.message.author.id = this.chaos.owner.id;
      });

      it('stops the bot', async function () {
        sinon.spy(this.command, 'run');
        sinon.spy(this.chaos, 'shutdown');

        let responses = await this.chaos.testMessage(this.message);
        expect(responses).to.containSubset([{ content: "Ok, shutting down now." }]);

        expect(this.command.run).to.have.been.called;
        expect(this.chaos.shutdown).to.have.been.called;
      });
    });
  });
});
