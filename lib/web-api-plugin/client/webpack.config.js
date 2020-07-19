const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {clientPath, buildPath} = require('../paths.js');

const cssLoader = {
  loader: 'css-loader',
  options: {
    modules: {
      auto: true,
    },
  },
};

module.exports = {
  mode: 'development',
  watch: true,
  entry: path.resolve(clientPath, 'App.jsx'),
  devtool: 'source-map',
  output: {
    path: buildPath,
    publicPath: '/assets',
    filename: '[Name].[Hash].bundle.js',
    chunkFilename: '[Name].[Hash].bundle.js',
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [
    new MiniCssExtractPlugin({filename: '[Hash].bundle.css'}),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Loading...',
      minify: true,
      templateContent: ({htmlWebpackPlugin}) => (`
        <html lang="en">
          <head>
            <meta charset="utf-8"/>
            <title>${htmlWebpackPlugin.options.title}</title>
          </head>
          <body>
            <div id="app"></div>
          </body>
        </html>
      `),
    }),
  ],
  resolve: {
    alias: {
      'chaos-core': path.resolve(__dirname),
      // Filled by WebApiServer
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', {'targets': {'chrome': '83', 'firefox': '76'}}],
              '@babel/preset-react',
            ],
            plugins: [
              '@babel/plugin-proposal-export-default-from',
            ],
          },
        },
      }, {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          cssLoader,
        ],
      }, {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          cssLoader,
          'sass-loader',
        ],
      }, {
        test: /\.(png|svg|jpg|gif)$/,
        use: [
          'file-loader',
        ],
      },
    ],
  },
};
