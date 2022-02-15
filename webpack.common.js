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
  entry: path.join(sourceDir, 'entry.js'),
  output: {
    filename: isProd ? 'bundle.js' : './bundle.js',
    path: buildDir,
    publicPath: '/',
  },
  resolve: {
    alias: {
      '~constants': `${sourceDir}/js/constants`,
      '~managers': `${sourceDir}/js/managers`,
      '~utils': `${sourceDir}/js/utils`,
      '~shaders': `${sourceDir}/js/shaders`,
    },
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
        use: [
          'raw-loader',
          'glslify-loader'
        ]
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
      template: path.join(sourceDir, 'index.html'),
    }),
    new CopyWebpackPlugin([
      {
        from: path.join(sourceDir, 'img'),
        to: 'img',
      },
      {
        from: path.join(sourceDir, 'css'),
        to: 'css',
      },
    ]),
  ].concat(isProd ? prodPlugins : []),
}
