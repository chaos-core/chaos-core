const ServicesManager = require('./services-manager');
const Service = require("../models/service");
const createChaosStub = require('../test/create-chaos-stub');

describe('ServicesManager', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.servicesManager = new ServicesManager(this.chaos);
  });

  describe('constructor', function () {
    it('initializes .services to an empty object', function () {
      expect(this.servicesManager.services).to.be.empty;
    });
  });

  describe('.services', function () {
    context('when no services have been added to the manager', function () {
      it('returns an empty list', function () {
        expect(this.servicesManager.services).to.be.empty;
      });
    });

    context('when services have been added to the manager', function () {
      class ServiceOne extends Service {}

      class ServiceTwo extends Service {}

      class ServiceThree extends Service {}

      beforeEach(function () {
        this.servicesManager.addService('test', ServiceOne);
        this.servicesManager.addService('test', ServiceTwo);
        this.servicesManager.addService('test', ServiceThree);
      });

      it("returns a list of all added services", function () {
        expect(this.servicesManager.services).to.have.lengthOf(3);
        let services = this.servicesManager.services.map((service) => service.name);
        expect(services).to.deep.equal([
          "ServiceOne",
          "ServiceTwo",
          "ServiceThree",
        ]);
      });
    });
  });

  describe('#addService', function () {
    class TestService extends Service {
    }

    it('makes the service retrievable via #getService', function () {
      this.servicesManager.addService('test', TestService);
      expect(this.servicesManager.getService('test', 'TestService')).to.be.an.instanceof(TestService);
    });

    it('initializes the service with a reference to ChaosCore', function () {
      this.servicesManager.addService('test', TestService);
      let testService = this.servicesManager.getService('test', 'TestService');
      expect(testService.chaos).to.eq(this.chaos);
    });

    context('when the service has already been added', function () {
      beforeEach(function () {
        this.servicesManager.addService('test', TestService);
      });

      it('raises an error', function () {
        expect(() => this.servicesManager.addService('test', TestService)).to.throw(
          Error, "The service 'test.TestService' has already been added.",
        );
      });
    });
  });

  describe('#getService', function () {
    class TestService extends Service {
    }

    context('when the service has been added to the manager', function () {
      beforeEach(function () {
        this.servicesManager.addService('test', TestService);
      });

      it('returns the requested service', function () {
        expect(this.servicesManager.getService('test', 'TestService')).to.be.an.instanceof(TestService);
      });
    });

    context('when the service has not been added to the manager', function () {
      it('raises an error', function () {
        expect(() => this.servicesManager.getService('test', 'TestService')).to.throw(
          Error, "The service 'test.TestService' could not be found",
        );
      });
    });
  });
});
