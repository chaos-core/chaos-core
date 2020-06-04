const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const cssLoader = {
  loader: "css-loader",
  options: {
    modules: {
      auto: true,
    },
  },
};

module.exports = {
  mode: 'development',
  watch: true,
  entry: path.resolve(__dirname, './web-client/index.jsx'),
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, './web-server/public'),
    publicPath: '/',
    filename: '[Name].[Hash].bundle.js',
    chunkFilename: '[Name].[Hash].bundle.js',
  },
  optimization: {
    usedExports: true,
    splitChunks: {
      chunks: 'all',
    }
  },
  plugins: [
    new MiniCssExtractPlugin({ filename: '[Hash].bundle.css' }),
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: "ChaosCore",
      minify: true,
      templateContent: ({ htmlWebpackPlugin }) => (`
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
              [
                "@babel/preset-env",
                {
                  "targets": {
                    "chrome": "83",
                    "firefox": "76",
                  },
                },
              ],
              "@babel/preset-react",
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
          "file-loader",
        ],
      },
    ],
  },
};
