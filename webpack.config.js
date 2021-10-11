var path = require('path')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'src', 'server.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    // libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        // exclude: /node_modules/,
      },
    ],
  },  
  target: 'node',
}
