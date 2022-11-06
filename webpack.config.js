const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const plugins = [
  new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
  new HtmlWebpackPlugin({
    title: 'PowerballX',
    favicon: `./src/img/favicon.ico`,
    template: './src/index.html'
  })
]


module.exports = {
  mode: 'development',
  // entry: './src/index.js',
  entry: {
    app: `./src/index.js`,
    ccs: './src/css.js',
    css_vendor: './src/css.vendor.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    port: 3012,
    publicPath: "http://localhost:3012/dist/",
    hotOnly: true,
    open: 'http://localhost:3012/dist/'
  },
  plugins: plugins,
  output: {
    filename: '[name].[hash].bundle.js',
    chunkFilename: '[name].[hash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        include: [
          path.resolve(__dirname, "./src/img")
        ],
        loader: 'file-loader',
        options: {
          outputPath: 'img',
          name: '[name].[ext]',
        },
      },
      {
        test: /\.svg$/,
        include: [
          path.resolve(__dirname, "./src/webfonts")
        ],
        loader: 'file-loader',
        options: {
          outputPath: 'webfonts',
          name: '[name].[ext]',
        },
      },
      {
        test: /\.(ttf|eot|svg|woff(2)?)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        include: [
          path.resolve(__dirname, "./src/webfonts")
        ],
        loader: 'file-loader',
        options: {
          outputPath: 'webfonts',
          name: '[name].[ext]',
        },
      },
      {
        test: /\.ttf$/,
        include: [
          path.resolve(__dirname, "./src/fonts")
        ],
        loader: 'file-loader',
        options: {
          outputPath: 'fonts',
          name: '[name].[ext]',
        },
      },
      {
        //test: /\.m?js$/,
        test: /\.js$/,
        //exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          // options: {
          //   presets: ['@babel/preset-env']
          // }
        }
      }
    ]
  },
  optimization: {
    splitChunks: {
      chunks: 'async',
      //minSize: 20000,
      //minRemainingSize: 0,
      // maxSize: 0,
      minSize: 0,
      maxSize: 20000,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      automaticNameDelimiter: '~',
      enforceSizeThreshold: 50000,
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          //name: 'vendors',
          name(module) {
            // get the name. E.g. node_modules/packageName/not/this/part.js
            // or node_modules/packageName
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

            // npm package names are URL-safe, but some servers don't like @ symbols
            return `npm.${packageName.replace('@', '')}`;
          },
          enforce: true,
          chunks: 'all',
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  }
};