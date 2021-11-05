const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const common = require('./webpack.common');

module.exports = env => {
  return merge(common(env), {
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.MODE': JSON.stringify('development')
      })
    ],
    devServer: {
      open: true,
      contentBase: path.join(__dirname, 'assets')
    }
  });
};
