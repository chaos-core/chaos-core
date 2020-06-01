const path = require('path');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './web-client/index.jsx'),
  output: {
    path: path.resolve(__dirname, './web-server/public'),
    filename: 'client.bundle.js',
  },
  resolve: {
    alias: {
      // Filled by WebApiServer
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env",
              "@babel/preset-react",
            ],
          },
        },
      },
    ],
  },
};
