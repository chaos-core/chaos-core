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
      }, {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
        ],
      }, {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }, {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          "file-loader",
        ],
      },
    ],
  },
};
