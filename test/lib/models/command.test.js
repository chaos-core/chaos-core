const MockContext = require("../../support/mock-context");
const Command = require("../../../lib/models/command");
const createChaosStub = require('../../support/create-chaos-stub');
const mocks = require("../../mocks");

describe('Command', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.cmdConfig = {
      name: "testCommand",
      pluginName: "test",
      run: function () {},
    };

    this.command = new Command(this.chaos, this.cmdConfig);
  });

  describe('attributes', function () {
    [
      "chaos",
      "pluginName",
      "name",
      "description",
      "run",
      "ownerOnly",
      "adminOnly",
      "permissions",
      "enabledByDefault",
      "showInHelp",
      "flags",
      "args",
      "services",
    ].forEach((attribute) => {
      it(attribute, function () {
        expect(this.command[attribute]).not.to.be.undefined;
      });
    });
  });

  describe('constructor', function () {
    it("assigns nix from the passed in reference", function () {
      this.command = new Command(this.chaos, this.cmdConfig);
      expect(this.command.chaos).to.eq(this.chaos);
    });

    [
      ["pluginName", "value"],
      ["name", "value"],
      ["description", "value"],
      ["run", sinon.fake()],
      ["ownerOnly", "value"],
      ["adminOnly", "value"],
      ["permissions", "value"],
      ["enabledByDefault", "value"],
      ["showInHelp", "value"],
      ["flags", []],
      ["args", []],
      ["services", "value"],
      ["customAttr", "value"],
    ].forEach(([attribute, value]) => {
      it(`assigns ${attribute} from the cmdConfig`, function () {
        this.cmdConfig[attribute] = value;
        this.command = new Command(this.chaos, this.cmdConfig);
        expect(this.command[attribute]).to.eq(value);
      });
    });

    it("ignores the chaos field from the cmdConfig", function () {
      this.cmdConfig.chaos = "notNix";
      this.command = new Command(this.chaos, this.cmdConfig);
      expect(this.command.chaos).to.eq(this.chaos);
    });

    context('when the name is missing', function () {
      beforeEach(function () {
        delete this.cmdConfig.name;
      });

      it('raises an error', function () {
        expect(() => new Command(this.chaos, this.cmdConfig)).to.throw(
          Error, "Name for command is missing.",
        );
      });
    });

    context('when the name not a string', function () {
      beforeEach(function () {
        this.cmdConfig.name = {};
      });

      it('raises an error', function () {
        expect(() => new Command(this.chaos, this.cmdConfig)).to.throw(
          Error, "Name for command is missing.",
        );
      });
    });

    context('when the run method is missing', function () {
      beforeEach(function () {
        delete this.cmdConfig.run;
      });

      it('raises an error', function () {
        expect(() => new Command(this.chaos, this.cmdConfig)).to.throw(
          Error, `run function for command ${this.cmdConfig.name} is missing.`,
        );
      });
    });

    context('when the run method is not a function', function () {
      beforeEach(function () {
        this.cmdConfig.run = 'not a function';
      });

      it('raises an error', function () {
        expect(() => new Command(this.chaos, this.cmdConfig)).to.throw(
          Error, `run function for command ${this.cmdConfig.name} is missing.`,
        );
      });
    });
  });

  describe('.requiredArgs', function () {
    context('when there are no arguments', function () {
      beforeEach(function () {
        this.command.args = [];
      });

      it('returns an empty array', function () {
        expect(this.command.requiredArgs).to.be.empty;
      });
    });

    context('when there are no required arguments', function () {
      beforeEach(function () {
        this.command.args = [
          { name: 'arg1' },
          { name: 'arg2' },
        ];
      });

      it('returns an empty array', function () {
        expect(this.command.requiredArgs).to.be.empty;
      });
    });

    context('when there are required arguments', function () {
      beforeEach(function () {
        this.command.args = [
          { name: 'arg1' },
          { name: 'arg2' },
          { name: 'reqArg1', required: true },
          { name: 'reqArg2', required: true },
        ];
      });

      it('returns an array of just required args', function () {
        expect(this.command.requiredArgs).to.deep.eq([
          { name: 'reqArg1', required: true },
          { name: 'reqArg2', required: true },
        ]);
      });
    });
  });

  describe('#execCommand', function () {
    beforeEach(function () {
      this.context = mocks.chaos.build("CommandContext");
      this.response = mocks.chaos.build("Response");
    });

    it('calls #checkMissingArgs', function () {
      this.command.checkMissingArgs = sinon.fake.returns(false);
      this.command.execCommand(this.context, this.response);
      expect(this.command.checkMissingArgs).to.have.been.calledWith(this.context);
    });

    it('calls #run', function () {
      this.command.run = sinon.fake();
      this.command.execCommand(this.context, this.response);
      expect(this.command.run).to.have.been.calledWith(this.context, this.response);
    });

    context('when the help flag is true', function () {
      beforeEach(function () {
        this.context.flags['help'] = true;
      });

      it('calls #help', function () {
        this.command.help = sinon.fake();
        this.command.execCommand(this.context, this.response);
        expect(this.command.help).to.have.been.calledWith(this.context, this.response);
      });
    });

    context('when args are missing', function () {
      beforeEach(function () {
        this.command.checkMissingArgs = sinon.fake.returns(true);
      });

      it('calls #argsMissing', function () {
        this.command.argsMissing = sinon.fake();
        this.command.execCommand(this.context, this.response);
        expect(this.command.argsMissing).to.have.been.calledWith(this.context, this.response);
      });
    });
  });

  describe('#help', function () {
    beforeEach(function () {
      this.context = new MockContext();
      this.response = mocks.chaos.create("Response");
      this.response.send = sinon.fake();

      this.context.chaos = this.chaos;
    });

    it("sends an embed type response", function () {
      this.command.help(this.context, this.response);
      expect(this.response.type).to.eq('embed');
      expect(this.response.content).not.to.be.undefined;
      expect(this.response.embed).not.to.be.undefined;
      expect(this.response.send).to.have.been.called;
    });
  });

  describe('#argsMissing', function () {
    beforeEach(function () {
      this.context = new MockContext();
      this.response = mocks.chaos.create("Response");
      this.response.send = sinon.fake();

      this.context.chaos = this.chaos;
    });

    it("sends an embed type response", function () {
      this.command.argsMissing(this.context, this.response);
      expect(this.response.type).to.eq('embed');
      expect(this.response.content).not.to.be.undefined;
      expect(this.response.embed).not.to.be.undefined;
      expect(this.response.send).to.have.been.called;
    });
  });

  describe('#helpEmbed', function () {
    it('creates an embed object', function () {
      let embed = this.command.helpEmbed();
      expect(embed.title).not.to.be.undefined;
      expect(embed.description).not.to.be.undefined;
      expect(embed.fields).not.to.be.undefined;
    });
  });
});
