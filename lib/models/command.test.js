const Command = require("./command");
const createChaosStub = require('../test/create-chaos-stub');
const { InvalidComponentError } = require("../errors");
const { MockCommandContext, MockResponse } = require("../test/mocks/chaos.mocks");

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
      "showInHelp",
      "flags",
      "args",
    ].forEach((attribute) => {
      it(attribute, function () {
        expect(this.command[attribute]).not.to.be.undefined;
      });
    });
  });

  describe('constructor', function () {
    it("assigns ChaosCore from the passed in reference", function () {
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
      ["showInHelp", "value"],
      ["flags", []],
      ["args", []],
      ["customAttr", "value"],
    ].forEach(([attribute, value]) => {
      it(`assigns ${attribute} from the cmdConfig`, function () {
        this.cmdConfig[attribute] = value;
        this.command = new Command(this.chaos, this.cmdConfig);
        expect(this.command[attribute]).to.deep.eq(value);
      });
    });

    it("ignores the chaos field from the cmdConfig", function () {
      this.cmdConfig.chaos = "notChaosCore";
      this.command = new Command(this.chaos, this.cmdConfig);
      expect(this.command.chaos).to.eq(this.chaos);
    });
  });

  describe("#allFlags", function () {
    it("appends system flags", function () {
      expect(this.command.allFlags.map((f) => f.name)).to.include('help');
    });
  });

  describe('#validate', function () {
    context('when the name is missing', function () {
      beforeEach(function () {
        delete this.cmdConfig.name;
        this.command = new Command(this.chaos, this.cmdConfig);
      });

      it('raises an error', function () {
        expect(() => this.command.validate()).to.throw(
          InvalidComponentError, "Name for command is missing.",
        );
      });
    });

    context('when the name not a string', function () {
      beforeEach(function () {
        this.cmdConfig.name = {};
        this.command = new Command(this.chaos, this.cmdConfig);
      });

      it('raises an error', function () {
        expect(() => this.command.validate()).to.throw(
          InvalidComponentError, "Name for command is missing.",
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
      this.context = new MockCommandContext({});
      this.response = new MockResponse({});
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
      this.context = new MockCommandContext({});
      this.response = new MockResponse({});
      this.response.send = sinon.fake();
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
      this.context = new MockCommandContext({
        chaos: this.chaos,
      });
      this.response = new MockResponse({});
      this.response.send = sinon.fake();
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
