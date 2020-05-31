const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './web-client/index.js'),
  output: {
    path: path.resolve(__dirname, './web-server/public'),
    filename: 'client.bundle.js',
  },
  resolve: {
    alias: {
      // Filled by WebApiServer
    },
  },
};
