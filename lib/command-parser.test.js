/* eslint-disable no-useless-escape */
const createChaosStub = require('./test/create-chaos-stub');
const CommandParser = require('./command-parser');
const CommandManager = require('./managers/command-manager');
const Command = require('./models/command');
const {InvalidPrefixError} = require('./errors');

describe('CommandParser', function () {
  describe('::parse', function () {
    beforeEach(function () {
      this.chaos = createChaosStub();

      this.validPrefixes = ['!'];
      this.message = {
        content: '!command',
      };

      this.commandManager = new CommandManager(this.chaos);
    });

    context('when the message does not start with a valid prefix', function () {
      beforeEach(function () {
        this.validPrefixes = ['!'];
        this.message.content = ':command';
      });

      it('raises a InvalidPrefixError', async function () {
        try {
          await CommandParser.parse(this.chaos, this.message, this.validPrefixes);
        } catch (error) {
          expect(error.message).to.eq('Message does not start with a valid prefix');
          return;
        }

        throw new Error('No error was raised');
      });
    });

    context('when the message does not have a valid command', function () {
      beforeEach(function () {
        this.validPrefixes = ['!'];
        this.message.content = '!command';
      });

      it('raises a InvalidPrefixError', async function () {
        try {
          await CommandParser.parse(this.chaos, this.message, this.validPrefixes);
        } catch (error) {
          expect(error.message).to.eq('Command \'command\' does not exist');
          return;
        }

        throw new Error('No error was raised');
      });
    });
  });

  describe('::nextParamValue', function () {
    it('when the paramString is empty it returns undefined', function () {
      let paramsString = '';
      expect(CommandParser.nextParamValue(paramsString)).to.be.undefined;
    });

    it('when the paramString is just whitespace it returns undefined', function () {
      let paramsString = '   ';
      expect(CommandParser.nextParamValue(paramsString)).to.be.undefined;
    });

    it('matches the first double quoted param', function () {
      let paramsString = '"value1" "value2"';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('"value1"');
    });

    it('matches the first double quoted param with escaped single quotes', function () {
      let paramsString = '"value \\\'1\\\'" "value \\\'2\\\'"';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('"value \\\'1\\\'"');
    });

    it('matches the first double quoted param with escaped double quotes', function () {
      let paramsString = '"value \\"1\\"" "value \\"2\\""';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('"value \\"1\\""');
    });

    it('matches the first double quoted param with a newline', function () {
      let paramsString = '"value\n1" "value\n2"';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('"value\n1"');
    });

    it('matches the first single quoted param', function () {
      let paramsString = '\'value1\' \'value2\'';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('\'value1\'');
    });

    it('matches the first single quoted param with escaped single quotes', function () {
      let paramsString = '\'value \\\'1\\\'\' \'value \\\'2\\\'\'';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('\'value \\\'1\\\'\'');
    });

    it('matches the first single quoted param with escaped double quotes', function () {
      let paramsString = '\'value \\"1\\"\' \'value \\"2\\"\'';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('\'value \\"1\\"\'');
    });

    it('matches the first single quoted param with escaped double quotes', function () {
      let paramsString = '\'value \\"1\\"\' \'value \\"2\\"\'';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('\'value \\"1\\"\'');
    });

    it('matches the first single quoted param with a newline', function () {
      let paramsString = '\'value\n1\' \'value\n2\'';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('\'value\n1\'');
    });

    it('matches the first json string', function () {
      let paramsString = '{value: \'one\'} {value: \'two\'}';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('{value: \'one\'}');
    });

    it('matches the first complex json string', function () {
      let paramsString = '{value: \'one\', nested: {key: \'value\'}, following: \'value\'} {value: \'two\'}';
      expect(CommandParser.nextParamValue(paramsString)).to.eq('{value: \'one\', nested: {key: \'value\'}, following: \'value\'}');
    });
  });

  describe('::isCommand', function () {
    context('when the message doesn\'t start with a valid prefix', function () {
      beforeEach(function () {
        this.message = {content: '!test'};
        this.prefixes = ['@'];
      });

      it('returns false', function () {
        expect(CommandParser.isCommand(this.message, this.prefixes)).to.equal(false);
      });
    });

    context('when the message does start with a valid prefix', function () {
      beforeEach(function () {
        this.message = {content: '!test'};
        this.prefixes = ['!'];
      });

      it('returns true', function () {
        expect(CommandParser.isCommand(this.message, this.prefixes)).to.equal(true);
      });
    });
  });

  describe('::processMessage', function () {
    context('when the message does not start with a valid prefix', function () {
      beforeEach(function () {
        this.message = {content: '!test'};
        this.prefixes = ['@'];
      });

      it('raises an error', function () {
        let self = this;

        expect(function () {
          return CommandParser.processMessage(self.message, self.prefixes);
        }).to.throw(InvalidPrefixError, 'Message does not start with a valid prefix');
      });
    });

    context('when the message is a command', function () {
      beforeEach(function () {
        this.message = {content: '!test param'};
        this.prefixes = ['!'];
      });

      it('returns the command name and params', function () {
        expect(CommandParser.processMessage(this.message, this.prefixes)).to.deep.eq({
          commandName: 'test',
          paramsString: 'param',
        });
      });
    });

    context('when the message has multiple params', function () {
      beforeEach(function () {
        this.message = {content: '!test param1 param2 param3'};
        this.prefixes = ['!'];
      });

      it('returns the command name and paramsString', function () {
        expect(CommandParser.processMessage(this.message, this.prefixes)).to.deep.eq({
          commandName: 'test',
          paramsString: 'param1 param2 param3',
        });
      });
    });
  });

  describe('::processParams', function () {
    beforeEach(function () {
      this.command = new Command(null);
    });

    context('when the command has no params', function () {
      beforeEach(function () {
        this.command.args = [];
      });

      it('returns a blank set of args', async function () {
        const context = await CommandParser.processParams(this.command, '');
        expect(context.args).to.deep.eq({});
      });
    });

    context('when the command has params', function () {
      beforeEach(function () {
        this.command.args = [
          {name: 'param1'},
          {name: 'param2'},
        ];
      });

      context('when the param string contains single words', function () {
        beforeEach(function () {
          this.paramsString = 'value1 value2';
        });

        it('parses the params correctly', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': 'value2',
          });
        });
      });

      context('when the param string does not have enough values', function () {
        beforeEach(function () {
          this.paramsString = 'value1';
        });

        it('missing values are set to undefined', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': undefined,
          });
        });
      });

      context('when the param string contains escaped strings', function () {
        beforeEach(function () {
          this.paramsString = '\'value 1\' "value 2"';
        });

        it('parses the params correctly', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value 1',
            'param2': 'value 2',
          });
        });

        context('when the param string contains escaped quotes', function () {
          beforeEach(function () {
            this.paramsString = '\'value \\\'1\\\'\' "value \'2\'"';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.args).to.deep.eq({
              'param1': 'value \'1\'',
              'param2': 'value \'2\'',
            });
          });
        });
      });

      context('when the last param is greedy', function () {
        beforeEach(function () {
          this.command.args.push(
            {name: 'param3', greedy: true},
          );
        });

        it('absorbs all remaining params', async function () {
          this.paramsString = 'value1 value2 this is value 3';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': 'value2',
            'param3': 'this is value 3',
          });
        });

        it('retains whitespace', async function () {
          this.paramsString = 'value1 value2 this  is  value 3';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': 'value2',
            'param3': 'this  is  value 3',
          });
        });

        it('retains newlines', async function () {
          this.paramsString = 'value1 value2 this is\nvalue 3';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': 'value2',
            'param3': 'this is\nvalue 3',
          });
        });
      });

      context('when the last param is not greedy', function () {
        beforeEach(function () {
          this.command.args.push(
            {name: 'param3', greedy: false},
          );
        });

        it('ignores any remaining params', async function () {
          this.paramsString = 'value1 value2 value3 value4';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'value1',
            'param2': 'value2',
            'param3': 'value3',
          });
        });
      });

      context('when the command has arg sanitization enabled', function () {
        beforeEach(function () {
          this.command.sanitizeArgs = true;
        });

        it('strips @everyone and @here from the params', async function () {
          this.paramsString = '@everyone @here';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': 'everyone',
            'param2': 'here',
          });
        });
      });

      context('when the command has arg sanitization disabled', function () {
        beforeEach(function () {
          this.command.sanitizeArgs = false;
        });

        it('leaves @everyone and @here in the params', async function () {
          this.paramsString = '@everyone @here';
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            'param1': '@everyone',
            'param2': '@here',
          });
        });
      });
    });

    context('when the command has args with defaults', function () {
      beforeEach(function () {
        this.command.args = [
          {name: 'param1', default: 'default1'},
          {name: 'param2', default: 'default2'},
          {name: 'param3', default: 'default3'},
        ];
      });

      context('when all params have values', function () {
        beforeEach(function () {
          this.paramsString = 'value1 value2 value3';
        });

        it('parses the entered params', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            param1: 'value1',
            param2: 'value2',
            param3: 'value3',
          });
        });
      });

      context('when some of the params have values', function () {
        beforeEach(function () {
          this.paramsString = 'value1';
        });

        it('uses the default for missing values', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            param1: 'value1',
            param2: 'default2',
            param3: 'default3',
          });
        });
      });

      context('when there are only flags', function () {
        beforeEach(function () {
          this.paramsString = '--flag1 --flag2';
        });

        it('uses the defaults', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.args).to.deep.eq({
            param1: 'default1',
            param2: 'default2',
            param3: 'default3',
          });
        });
      });
    });

    context('when the command has no flags', function () {
      beforeEach(function () {
        this.command.flags = [];
      });

      context('when the paramsString is blank', function () {
        beforeEach(function () {
          this.paramsString = '';
        });

        it('returns a blank set of flags', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.flags)
            .to.deep.eq({help: false});
        });
      });

      context('when the paramsString contains flags', function () {
        beforeEach(function () {
          this.paramsString = '--flag1 --flag2';
        });

        it('ignores the flags', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.flags)
            .to.deep.eq({help: false});
        });
      });
    });

    context('when the command has flags', function () {
      context('when the flag is marked as an integer', function () {
        beforeEach(function () {
          this.command.flags = [
            {name: 'flag1', type: 'int'},
            {name: 'flag2', type: 'int'},
          ];
        });

        context('when the flags are followed by a string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 value1 --flag2 value2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: NaN,
              flag2: NaN,
              help: false,
            });
          });
        });

        context('when the flags are followed by a integer', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 1 --flag2 2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 1,
              flag2: 2,
              help: false,
            });
          });
        });

        context('when the flags are followed by a float', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 1 --flag2 2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 1,
              flag2: 2,
              help: false,
            });
          });
        });

        context('when the flags are missing values', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 --flag2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: undefined,
              flag2: undefined,
              help: false,
            });
          });
        });
      });

      context('when the flag is marked as a float', function () {
        beforeEach(function () {
          this.command.flags = [
            {name: 'flag1', type: 'float'},
            {name: 'flag2', type: 'float'},
          ];
        });

        context('when the flags are followed by a string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 value1 --flag2 value2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: NaN,
              flag2: NaN,
              help: false,
            });
          });
        });

        context('when the flags are followed by a integer', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 1 --flag2 2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 1,
              flag2: 2,
              help: false,
            });
          });
        });

        context('when the flags are followed by a float', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 1.5 --flag2 2.5';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 1.5,
              flag2: 2.5,
              help: false,
            });
          });
        });

        context('when the flags are missing values', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 --flag2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: undefined,
              flag2: undefined,
              help: false,
            });
          });
        });
      });

      context('when the flag is marked as a string', function () {
        beforeEach(function () {
          this.command.flags = [
            {name: 'flag1', type: 'string'},
            {name: 'flag2', type: 'string'},
          ];
        });

        context('when the flags are followed by a string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 value1 --flag2 value2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 'value1',
              flag2: 'value2',
              help: false,
            });
          });
        });

        context('when the flags are followed by a single quoted string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 \'value 1\' --flag2 \'value 2\'';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 'value 1',
              flag2: 'value 2',
              help: false,
            });
          });
        });

        context('when the flags are followed by a double quoted string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 "value 1" --flag2 "value 2"';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: 'value 1',
              flag2: 'value 2',
              help: false,
            });
          });
        });

        context('when the flags are followed by a json string', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 {value: "1"} --flag2 {value: "2"}';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: '{value: "1"}',
              flag2: '{value: "2"}',
              help: false,
            });
          });
        });

        context('when the flags are missing values', function () {
          beforeEach(function () {
            this.paramsString = '--flag1 --flag2';
          });

          it('parses the params correctly', async function () {
            const context = await CommandParser.processParams(this.command, this.paramsString);
            expect(context.flags).to.deep.eq({
              flag1: undefined,
              flag2: undefined,
              help: false,
            });
          });
        });
      });
    });

    context('when the command has flags with defaults', function () {
      beforeEach(function () {
        this.command.flags = [
          {name: 'flag1', type: 'string', default: 'default1'},
          {name: 'flag2', type: 'string', default: 'default2'},
        ];
      });

      context('when all flags have values', function () {
        beforeEach(function () {
          this.paramsString = '--flag1 value1 --flag2 value2';
        });

        it('parses the entered params', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.flags).to.deep.eq({
            flag1: 'value1',
            flag2: 'value2',
            help: false,
          });
        });
      });

      context('when some of the params have values', function () {
        beforeEach(function () {
          this.paramsString = '--flag1 value1';
        });

        it('uses the default for missing values', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.flags).to.deep.eq({
            flag1: 'value1',
            flag2: 'default2',
            help: false,
          });
        });
      });

      context('when there are only args', function () {
        beforeEach(function () {
          this.paramsString = 'value1 value2';
        });

        it('uses the defaults', async function () {
          const context = await CommandParser.processParams(this.command, this.paramsString);
          expect(context.flags).to.deep.eq({
            flag1: 'default1',
            flag2: 'default2',
            help: false,
          });
        });
      });
    });

    context('when the command has a mix of flags and args', function () {
      beforeEach(function () {
        this.command.args = [
          {name: 'param1'},
          {name: 'param2'},
        ];

        this.command.flags = [
          {name: 'flag1', type: 'string'},
          {name: 'flag2', type: 'string'},
        ];

        this.paramsString = 'valuea1 --flag1 valuef1 valuea2 --flag2 valuef2';
      });

      it('parses the params correctly', async function () {
        const context = await CommandParser.processParams(this.command, this.paramsString);
        expect(context).to.deep.eq({
          args: {
            'param1': 'valuea1',
            'param2': 'valuea2',
          },
          flags: {
            flag1: 'valuef1',
            flag2: 'valuef2',
            help: false,
          },
        });
      });
    });
  });

  describe('::escapeParamValue', function () {
    context('when a string is passed', function () {
      it('leaves unquoted strings alone', function () {
        let paramValue = 'value "1"';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value "1"');
      });

      it('replaces mismatched quoted strings', function () {
        let paramValue = '\'value 1"';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value 1');
      });

      it('replaces start and end single quotes', function () {
        let paramValue = '\'value 1\'';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value 1');
      });

      it('replaces escaped single quotes in single quoted strings', function () {
        let paramValue = '\'value \\\'1\\\'\'';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value \'1\'');
      });

      it('replaces escaped double quotes in single quoted strings', function () {
        let paramValue = '\'value \\"1\\"\'';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value "1"');
      });

      it('keeps newlines in single quoted strings', function () {
        let paramValue = '\'value\n1\'';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value\n1');
      });

      it('replaces start and end double quotes', function () {
        let paramValue = '"value 1"';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value 1');
      });

      it('replaces escaped single quotes in double quoted string', function () {
        let paramValue = '"value \\\'1\\\'"';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value \'1\'');
      });

      it('replaces escaped double quotes in double quoted string', function () {
        let paramValue = '"value \\"1\\""';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value "1"');
      });

      it('keeps newlines in double quoted strings', function () {
        let paramValue = '"value\n1"';
        expect(CommandParser.escapeParamValue(paramValue)).to.eq('value\n1');
      });
    });
  });

  describe('::sanitize', function () {
    it('returns clean strings without changes', function () {
      expect(CommandParser.sanitize('This string has no issues'))
        .to.eq('This string has no issues');
    });

    it('disarms @everyone in the message', function () {
      expect(CommandParser.sanitize('Hey @everyone check this out! @everyone!'))
        .to.eq('Hey everyone check this out! everyone!');
    });

    it('disarms @here in the message', function () {
      expect(CommandParser.sanitize('Hey @here check this out! @here!'))
        .to.eq('Hey here check this out! here!');
    });

    it('strips multiple @ signs in the message', function () {
      expect(CommandParser.sanitize('Hey @@@everyone check this out!'))
        .to.eq('Hey everyone check this out!');
      expect(CommandParser.sanitize('Hey @@@here check this out!'))
        .to.eq('Hey here check this out!');
    });
  });
});
