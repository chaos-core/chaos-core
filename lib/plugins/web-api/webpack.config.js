const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './web-client/index.jsx'),
  output: {
    path: path.resolve(__dirname, './web-server/public'),
    publicPath: '/',
    filename: '[name].bundle.js',
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "ChaosCore",
      minify: true,
      templateContent: ({ htmlWebpackPlugin: webpack }) => (`
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <title>${webpack.options.title}</title>
            ${webpack.tags.headTags}
          </head>
          <body>
            <div id="app"></div>
            ${webpack.tags.bodyTags}
          </body>
        </html>
      `),
    }),
  ],
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
            plugins: [
              "@babel/plugin-proposal-export-default-from",
            ],
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
