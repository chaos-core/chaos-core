const Rx = require('rx');
const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon = require('sinon').createSandbox();
const Factory = require("./../support/factory");

const expect = chai.expect;
chai.use(sinonChai);

Factory.setSandbox(sinon);

const CommandManager = require('./../../lib/managers/command-manager');
const Context = require('./../../lib/models/Context');
const Command = require('./../../lib/models/command');
const NixCore = require('./../../nix-core');

describe('CommandManager', function () {
  let cmdManager;

  before(function (done) {
    Factory.loadFactories(done);
  });


  beforeEach(function () {
    cmdManager = new CommandManager();
  });

  afterEach(function () {
    sinon.restore();
  });

  describe('constructor', function () {
    context('when not passed any params', function () {
      beforeEach(function () {
        cmdManager = new CommandManager();
      });

      it ('has an empty list of commands', function () {
        expect(cmdManager.commands).to.eql({});
      });

      it('defaults to the ! prefix', function () {
        expect(cmdManager.commandPrefix).to.eql('!');
      });
    });

    context('when passed a list of commands', function () {
      let commands;

      beforeEach(function () {
        commands = [ { name: 'cmd1' }, { name: 'cmd2' }, {name: 'cmd3'} ];
        cmdManager = new CommandManager(commands);
      });

      it('adds the commands', function () {
        expect(cmdManager.commands['cmd1']).to.exist;
        expect(cmdManager.commands['cmd2']).to.exist;
        expect(cmdManager.commands['cmd3']).to.exist;
      });
    });

    context('when passed a prefix', function () {
      beforeEach(function () {
        cmdManager = new CommandManager([], '?');
      });

      it('sets the prefix', function () {
        expect(cmdManager.commandPrefix).to.eql('?');
      });
    });
  });

  describe('#addCommand', function () {
    let newCommand;

    beforeEach(function () {
      newCommand = {
        name: 'cmd1',
        description: 'example command 1',
        run: () => {},
      };
    });

    it('adds a command', function () {
      cmdManager.addCommand(newCommand);
      expect(cmdManager.commands['cmd1']).to.eql(new Command(newCommand));
    });

    context('the name is already in use', function () {
      let existingCommand;

      beforeEach(function () {
        existingCommand = {
          name: 'cmd1',
          description: 'existing command',
        };

        cmdManager.commands['cmd1'] = new Command(existingCommand);
      });

      it('overwrites the command', function () {
        cmdManager.addCommand(newCommand);
        expect(cmdManager.commands['cmd1'].description).to.eql(newCommand.description);
      });
    });
  });

  describe('#msgIsCommand', function () {
    let message;

    context('when the message does not start with the prefix', function () {
      beforeEach(function () {
        message = {
          content: '?test',
        };
      });

      it('returns false', function () {
        expect(cmdManager.msgIsCommand(message)).to.be.false;
      });
    });

    context('when the message starts with the prefix', function() {
      beforeEach(function () {
        message = {
          content: '!test',
        };
      });

      context('when the command is not defined', function () {
        beforeEach(function () {
          cmdManager.commands['test'] = undefined;
        });

        it('returns false', function () {
          expect(cmdManager.msgIsCommand(message)).to.be.false;
        });
      });

      context('when the command is defined', function () {
        beforeEach(function () {
          cmdManager.commands['test'] = new Command({ name: 'test' });
        });

        it('returns true', function () {
          expect(cmdManager.msgIsCommand(message)).to.be.true;
        });
      });
    });
  });

  describe('#runCommandForMsg', function () {
    let message;
    let nix;
    let command;

    beforeEach(function (done) {
      nix = Factory.create('NixCore');
      nix.findOwner().subscribe(() => done());

      command = new Command({
        name: 'cmd1',
        description: 'example command 1',
        run: sinon.stub(),
      });

      message = Factory.create('Message', {
        content: '!' + command.name,
        channelType: 'text',
      });

      cmdManager.commands['cmd1'] = command;
    });

    describe('enabled check', function () {
      it('runs the check', function (done) {
        sinon.stub(cmdManager, '_filterCommandEnabled').returns(Rx.Observable.return(true));

        cmdManager.runCommandForMsg(message, nix)
          .subscribe(
            () => {},
            (err) => done(err),
            () => {
              expect(cmdManager._filterCommandEnabled).to.have.been.called;
              done();
            }
          );
      });

      context('when the command is enabled', function () {
        beforeEach(function () {
          sinon.stub(cmdManager, 'isCommandEnabled').returns(Rx.Observable.return(true));
        });

        it('runs the command', function(done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });
      });

      context('when the command is disabled', function () {
        beforeEach(function () {
          sinon.stub(cmdManager, 'isCommandEnabled').returns(Rx.Observable.return(false));
        });

        it('does not run the command', function(done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });
      });
    });

    describe('has permission check', function () {
      it('runs the check', function (done) {
        sinon.stub(cmdManager, '_filterHasPermission').returns(Rx.Observable.return(true));

        cmdManager.runCommandForMsg(message, nix)
          .subscribe(
            () => {},
            (err) => done(err),
            () => {
              expect(cmdManager._filterHasPermission).to.have.been.called;
              done();
            }
          );
      });

      context('when the user does not have permission', function () {
        beforeEach(function () {
          sinon.stub(cmdManager, '_filterHasPermission').returns(Rx.Observable.empty());
        });

        it('does not run the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {
              },
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });
      });

      context('when the user does have permission', function () {
        beforeEach(function () {
          sinon.stub(cmdManager, '_filterHasPermission').returns(Rx.Observable.return(true));
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });
      });
    });

    describe('help flag check', function () {
      it('runs the check', function (done) {
        sinon.stub(cmdManager, '_filterHelpFlag').returns(Rx.Observable.return(true));

        cmdManager.runCommandForMsg(message, nix)
          .subscribe(
            () => {},
            (err) => done(err),
            () => {
              expect(cmdManager._filterHelpFlag).to.have.been.called;
              done();
            }
          );
      });

      context('when the command does not have a help flag', function () {
        beforeEach(function () {
          message.content = `!${command.name}`;
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });

        it('does not send a help message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).not.to.have.been.calledWith("Here's how to use that command:");
                done();
              }
            );
        });
      });

      context('when the command has the --help flag', function () {
        beforeEach(function () {
          message.content = `!${command.name} --help`;
        });

        it('does not run the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });

        it('sends a help message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).to.have.been.calledWith("Here's how to use that command:");
                done();
              }
            );
        });
      });

      context('when the command has the -h flag', function () {
        beforeEach(function () {
          message.content = `!${command.name} -h`;
        });

        it('does not run the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });

        it('sends a help message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).to.have.been.calledWith("Here's how to use that command:");
                done();
              }
            );
        });
      });
    });

    describe('scope check', function () {
      it('runs the check', function (done) {
        sinon.stub(cmdManager, '_filterScope').returns(Rx.Observable.return(true));

        cmdManager.runCommandForMsg(message, nix)
          .subscribe(
            () => {
            },
            (err) => done(err),
            () => {
              expect(cmdManager._filterScope).to.have.been.called;
              done();
            }
          );
      });

      context('when the command has no scope', function () {
        beforeEach(function () {
          command.scope = [];
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });

        it('does not send a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).not.to.have.been.calledWith("Here's how to use that command:");
                done();
              }
            );
        });
      });

      context('when command scope includes type', function () {
        beforeEach(function () {
          command.scope = ['text'];
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });

        it('does not send a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).not.to.have.been.called;
                done();
              }
            );
        });
      });

      context('when command scope excludes type', function () {
        beforeEach(function () {
          command.scope = ['other'];
        });

        it('does not run the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });

        it('sends a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).to.have.been.calledWith("I'm sorry, but that command isn't available here.");
                done();
              }
            );
        });
      });
    });

    describe('missing args check', function () {
      it('runs the check', function (done) {
        sinon.stub(cmdManager, '_filterMissingArgs').returns(Rx.Observable.return(true));

        cmdManager.runCommandForMsg(message, nix)
          .subscribe(
            () => {},
            (err) => done(err),
            () => {
              expect(cmdManager._filterMissingArgs).to.have.been.called;
              done();
            }
          );
      });

      context("when there are no missing arguments", function () {
        beforeEach(function () {
          command.args = [
            {name: 'param1', required: true},
            {name: 'param2'},
          ];

          message.content = `!${command.name} value1 value2`;
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {
              },
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });

        it('does not send a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {
              },
              (err) => done(err),
              () => {
                expect(message.channel.send).not.to.have.been.called;
                done();
              }
            );
        });
      });

      context("when there are missing optional arguments", function () {
        beforeEach(function () {
          command.args = [
            {name: 'param1', required: true},
            {name: 'param2'},
          ];

          message.content = `!${command.name} value1`;
        });

        it('runs the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).to.have.been.called;
                done();
              }
            );
        });

        it('does not send a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).not.to.have.been.called;
                done();
              }
            );
        });
      });

      context("when there are missing required arguments", function () {
        beforeEach(function () {
          command.args = [
            {name: 'param1', required: true},
            {name: 'param2', required: true},
          ];

          message.content = `!${command.name} value1`;
        });

        it('does not run the command', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(command.run).not.to.have.been.called;
                done();
              }
            );
        });

        it('sends a message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {},
              (err) => done(err),
              () => {
                expect(message.channel.send).to.have.been.called;
                done();
              }
            );
        });

        it('sends the help message to the channel', function (done) {
          cmdManager.runCommandForMsg(message, nix)
            .subscribe(
              () => {
              },
              (err) => done(err),
              () => {
                expect(message.channel.send).to.have.been.calledWith('I\'m sorry, but I\'m missing some information for that command:');
                done();
              }
            );
        });
      });
    });
  });
});
