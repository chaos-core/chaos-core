class Plugin {
  name = 'Name';
  description = null;

  dependencies = [];

  defaultData = [];

  permissionLevels = [];
  services = [];
  configActions = [];
  commands = [];
  webRouter = null;
  webClient = null;

  _strings = {};

  constructor(chaos, options) {
    this.chaos = chaos;
    Object.assign(this, options);

    this.chaos.on('chaos.listen', () => {
      this.pluginService = this.chaos.getService('core', 'PluginService');
    });
  }

  isEnabled(guild) {
    return this.pluginService.isPluginEnabled(guild.id, this.name);
  }

  get strings() {
    return this._strings;
  }

  set strings(strings) {
    return this._strings = strings;
  }

  validate() {
    return true;
  }
}

module.exports = Plugin;
