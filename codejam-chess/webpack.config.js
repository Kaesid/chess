const path = require('path');
const {
  LoaderOptionsPlugin
} = require('webpack');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');
const WebSocket= require(`ws`)

const devServer = (isDev) =>
  !isDev ? {} : {
    devServer: {
      open: true,
      hot: true,
      inline: true,
      port: 8080,
      // Make webpack-dev-server live-reload when your
      // shell page changes
      watchContentBase: true,
      contentBase: './src/',
      transportMode: 'ws',
      // contentBase: path.join(__dirname, "public"),
    },
  };

const esLintPlugin = (isDev) =>
  isDev ? [] : [new ESLintPlugin({
    extensions: ['ts', 'js']
  })];

module.exports = ({
  development
}) => ({
  mode: development ? 'development' : 'production',
  // devtool: development ? 'inline-source-map' : false,
  devtool: 'eval-source-map',
  context: path.resolve(__dirname, 'src'), //часть пути у искомым файлам, который теперь не надо указывать в других полях.
  entry: {
    main: './index.ts', // main - имя переменной
    // page2: './index.ts'// возможность указать css и ts файлы для отдельных страниц
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    assetModuleFilename: 'assets/[hash][ext]',
    sourceMapFilename: '[file].map',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    }
  },
  performance: {
    hints: 'warning', // enumeration
    maxAssetSize: 30000000, // integer type (in bytes)
    maxEntrypointSize: 50000000, // integer type (in bytes)
    assetFilter: function (assetFilename) {
      // Provide the assertion function of the resource file name
      return assetFilename.endsWith('.css') || assetFilename.endsWith('.js');
    },
  },
  module: {
    rules: [{
        test: /\.[tj]s$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        type: 'asset/resource',
      },
      // ----------------------------
      // {
      //   test: /\.(jpe?g|png|svg|gif)$/,
      //   use: [
      //     {
      //       loader: 'file-loader',
      //       options: {
      //         outputPath: 'assets',
      //         name: '[name].[ext]',
      //       },
      //     },
      //   ],
      // },

      // ---------------------------------

      {
        test: /\.(woff(2)?|eot|ttf|otf)$/i,
        type: 'asset/resource',
        // loader: "file-loader",
      },
      // {
      //   // HTML LOADER
      //   test: /\.html$/,
      //   loader: "html-loader",
      // },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: false,
          },
        }, ],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  plugins: [
    new LoaderOptionsPlugin(),

    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css'
    }),

    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false
    }),

    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      chunks: ['main'],
      filename: 'index.html',
    }),
    //   new HtmlWebpackPlugin({
    //     template: './test.html',
    //     inject: true,
    //     chunks: ['main'],
    //     filename: 'test.html'
    // }),

    new CopyWebpackPlugin({
      patterns: [
        // {
        //   from: './assets/images/packs/',
        //   to: '../assets/images/packs/'
        // },
        // { from: './test.html', to: './test.html' },
        {
          from: "./assets/icons",
          to: "../assets/icons"
        },
        // { from: "./assets/icons", to: "assets/icons" },
      ],
      options: {
        concurrency: 100,
      },
    }),
    ...esLintPlugin(development), //eslint check on build
  ],
  ...devServer(development),
});
