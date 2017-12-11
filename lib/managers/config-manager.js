const Rx = require('rx');

class ConfigManager {
  constructor() {
    this._modules = {};
  }

  addConfigActions(module) {
    let existingModule = this._modules[module.name];
    if (existingModule) {
      Object.assign(existingModule, module.actions);
    }
    else {
      this._modules[module.name] = module.actions;
    }
  }

  getModule(moduleName) {
    return this._modules[moduleName];
  }

  get modules() {
    return this._modules;
  }
}

module.exports = ConfigManager;
