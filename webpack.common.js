const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = env => {
  const buildMain = env.app === 'main';
  return {
    entry: buildMain ? './src/index.tsx' : './src/adminIndex.tsx',
    output: {
      filename: '[name].[chunkhash].js',
      path: buildMain ? path.resolve(__dirname, 'dist') : path.resolve(__dirname, 'dist', 'admin')
    },
    resolve: {
      // Add '.ts' and '.tsx' as resolvable extensions.
      extensions: [".ts", ".tsx", ".js", ".jsx"]
    },
    plugins: [
      new webpack.ProgressPlugin(),
      new HtmlWebpackPlugin({
        template: 'public/index.html'
      })
    ],

    module: {
      rules: [
        {
          test: /.(js|jsx)$/,
          include: [path.resolve(__dirname, 'src')],
          loader: 'babel-loader',
          options: {
            plugins: [
              'syntax-dynamic-import',
              "@babel/plugin-proposal-class-properties"
            ],
            presets: [
              '@babel/preset-react',
              [
                '@babel/preset-env',
                {
                  targets: 'cover 99.5% in US'
                }
              ]
            ]
          }
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
       // All output '.js' files will have any sourcemaps re-processed by 'source-map-loader'.
       {
          enforce: "pre",
          test: /\.js$/,
          loader: "source-map-loader"
      },
      {
        test: /\.s?[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      }, 
      {
        test: /\.(png|svg|jpg|gif|pdf)$/,
        use: [
          'file-loader',
        ],
      },
		]
  },

    optimization: {
      splitChunks: {
        cacheGroups: {
          vendors: {
            priority: -10,
            test: /[\\/]node_modules[\\/]/
          }
        },

        chunks: 'async',
        minChunks: 1,
        minSize: 30000,
        name: true
      }
    }
  };
}