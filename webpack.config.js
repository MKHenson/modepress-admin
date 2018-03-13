const path = require( 'path' );
const webpack = require( 'webpack' );

module.exports = {
  entry: './src/client.tsx',
  output: {
    filename: 'bundle.js',
    path: path.join( __dirname, 'dist/client' )
  },
  plugins: [
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.DefinePlugin( {
      'process.env': {
        NODE_ENV: JSON.stringify( process.env.NODE_ENV ),
        client: JSON.stringify( 'client' )
      }
    } )
  ],
  module: {
    rules: [
      {
        test: /\.(jpg|png|svg)$/,
        loader: 'file-loader',
        options: {
          name: '[path][name].[hash].[ext]',
        },
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: "source-map-loader"
      },
      {
        enforce: 'pre',
        test: /\.tsx?$/,
        use: "source-map-loader"
      }
    ]
  },
  resolve: {
    extensions: [ "*", ".tsx", ".ts", ".js" ]
  },
  devtool: 'inline-source-map'
};