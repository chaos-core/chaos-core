const commandConfigActions = require('./commands');
const permissionConfigActions = require('./permissions');
const pluginConfigActions = require('./plugins');
const setPrefix = require('./set-prefix');

module.exports = {
  setPrefix,
  ...commandConfigActions,
  ...permissionConfigActions,
  ...pluginConfigActions,
};
