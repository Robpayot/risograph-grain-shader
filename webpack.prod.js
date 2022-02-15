const w = require('webpack-merge')
const common = require('./webpack.common.js')

module.exports = w.merge(common, {
  mode: 'production',
})
