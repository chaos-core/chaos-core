const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon').createSandbox();
const Factory = require("./support/factory");

const expect = chai.expect;
chai.use(sinonChai);

const NixCore = require('./../nix-core');


describe('NixCore', function () {
  let nix;
  let ownerUser;

  beforeEach(function () {
    ownerUser = Factory.create('User');
    nix = Factory.create('NixCore', { owner: ownerUser });
  });

  afterEach(function () {
    nix.shutdown();
    sinon.restore();
  });

  describe('#listen()', function () {
    it('finds the owner', function (done) {
      nix.listen(
        () => {
          expect(nix.owner).to.equal(ownerUser);
          done();
        },
        (err) => done(err)
      );
    });

    it('messages the owner', function (done) {
      nix.listen(
        () => {
          expect(ownerUser.send).to.have.been.calledWith("I'm now online.");
          done();
        },
        (err) => done(err)
      );
    });

    it('does not immediately complete', function (done) {
      let completeSpy = sinon.spy();

      nix.listen(
        () => {
          setTimeout(() => {
            expect(completeSpy).not.to.have.been.called;
            done();
          }, 500);
        },
        (err) => done(err),
        () => completeSpy()
      );
    });

    context('when passed a ready callback', function() {
      it('calls it when ready', function (done) {
        nix.listen(
          () => done()
        );
      });
    });

    context('when passed an error callback', function () {
      it('calls it when there is an error during bootup', function (done) {
        nix.discord.login.rejects();

        nix.listen(
          undefined,
          () => done()
        );
      });
    });

    context('when passed a complete callback', function () {
      it('calls it when complete', function (done) {
        nix.listen(
          () => nix.shutdown(),
          undefined,
          () => done()
        );
      });
    });
  });

  describe('#shutdown()', function () {
    it('stops the listen stream', function (done) {
      nix.listen(
        () => nix.shutdown(),
        (err) => done(err),
        () => done()
      );
    });

    it('stops the guildCreate$ stream', function (done) {
      nix.listen(
        () => {
          nix.streams.guildCreate$.subscribe(
            () => {},
            (err) => done(err),
            () => done()
          );

          nix.shutdown();
        },
        (err) => done(err)
      );
    });

    it('stops the disconnect$ stream', function (done) {
      nix.listen(
        () => {
          nix.streams.disconnect$.subscribe(
            () => {
            },
            (err) => done(err),
            () => done()
          );

          nix.shutdown();
        },
        (err) => done(err)
      );
    });

    it('stops the message$ stream', function (done) {
      nix.listen(
        () => {
          nix.streams.message$.subscribe(
            () => {
            },
            (err) => done(err),
            () => done()
          );

          nix.shutdown();
        },
        (err) => done(err)
      );
    });

    it('stops the command$ stream', function (done) {
      nix.listen(
        () => {
          nix.streams.command$.subscribe(
            () => {
            },
            (err) => done(err),
            () => done()
          );

          nix.shutdown();
        },
        (err) => done(err)
      );
    });
  });

  describe('message event', function () {
    let message;

    beforeEach(function () {
      message = {content: 'message'};
    });

    it('checks if the message is a command', function (done) {
      let msgIsCommand = sinon.spy(nix.commandManager, 'msgIsCommand');

      nix.listen(
        () => {
          nix.streams.message$.subscribe(
            () => {
              expect(msgIsCommand).to.have.been.calledWith(message);
              done();
            },
            (err) => done(err)
          );

          nix.discord.emit('message', message);
        },
        (err) => done(err)
      );
    });

    context('when the message contains a command', function () {
      let msgIsCommand;
      let runCommandForMsg;

      beforeEach(function () {
        msgIsCommand = sinon.stub(nix.commandManager, 'msgIsCommand').returns(true);
        runCommandForMsg = sinon.stub(nix.commandManager, 'runCommandForMsg').resolves();
      });

      it('runs the requested command', function (done) {
        nix.listen(
          () => {
            nix.streams.message$.subscribe(
              () => {
                expect(msgIsCommand).to.have.been.calledWith(message);
                expect(runCommandForMsg).to.have.been.calledWith(message);
                done();
              },
              (err) => done(err)
            );

            nix.discord.emit('message', message);
          },
          (err) => done(err)
        );
      });
    });

    context('when the message does not contain a command', function () {
      let msgIsCommand;
      let runCommandForMsg;

      beforeEach(function () {
        msgIsCommand = sinon.stub(nix.commandManager, 'msgIsCommand').returns(false);
        runCommandForMsg = sinon.stub(nix.commandManager, 'runCommandForMsg').resolves();
      });

      it('does not try to run a command', function (done) {
        nix.listen(
          () => {
            nix.streams.message$.subscribe(
              () => {
                expect(msgIsCommand).to.have.been.calledWith(message);
                expect(runCommandForMsg).not.to.have.been.calledWith(message);
                done();
              },
              (err) => done(err)
            );

            nix.discord.emit('message', message);
          },
          (err) => done(err)
        );
      });
    });
  });
});
