const path = require('path');

module.exports = {
  mode: 'production',
  entry: './main.ts', // Your entry file
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    libraryTarget: 'commonjs2',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  externals: {
    obsidian: 'commonjs obsidian', // Don't bundle Obsidian's API
  },
};
