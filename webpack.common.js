const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ImageminPlugin = require('imagemin-webpack-plugin').default

const mode = process.env.NODE_ENV || 'production'

const sourceDir = path.join(__dirname, 'src')
const buildDir = path.join(__dirname, 'build')

const isProd = mode === 'production'
const prodPlugins = [new ImageminPlugin({ test: /\.(jpeg|png|gif|svg)$/i })]

module.exports = {
  mode,
  devtool: 'source-map',
  entry: {
    demo1: path.join(sourceDir, 'demo1/entry.js'),
    demo2: path.join(sourceDir, 'demo2/entry.js'),
  },
  output: {
    path: buildDir,
    filename: '[name]/bundle.js',
    publicPath: isProd ? './' : '/',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(glsl|vs|fs|vert|frag)$/,
        exclude: /node_modules/,
        use: ['raw-loader', 'glslify-loader'],
      },
      {
        test: /\.(obj)$/,
        use: [
          {
            loader: 'file-loader',
            options: { name: 'models/[name].[ext]' },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      chunks: ['demo1'],
      filename: 'index.html',
      template: path.join(sourceDir, 'index.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['demo2'],
      filename: 'index2.html',
      template: path.join(sourceDir, 'index2.html'),
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(sourceDir, 'demo1/img'),
        to: 'demo1/img',
      },
      {
        from: path.join(sourceDir, 'demo2/img'),
        to: 'demo2/img',
      },
      {
        from: path.join(sourceDir, 'css'),
        to: 'css',
      },
    ]),
  ].concat(isProd ? prodPlugins : []),
}
