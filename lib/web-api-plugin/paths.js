const path = require('path');

const pluginDir = path.resolve(__dirname);

module.exports = {
  serverPath: path.join(pluginDir, 'server'),
  clientPath: path.join(pluginDir, 'client'),
  buildPath: path.join(pluginDir, 'build'),
};
