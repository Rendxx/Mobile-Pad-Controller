var webpack = require('webpack');
var path = require('path');
var root = path.resolve(__dirname);
var commonsPlugin = new webpack.optimize.CommonsChunkPlugin('common');

module.exports = {
    devtool: 'source-map',
    plugins: [
        commonsPlugin,
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({ 
            mangle: {
                keep_fnames: true
            }
        })
    ],
    entry: {
        'controller.button' : './Button/src/controller.button',
        'controller.direction' : './Direction/src/controller.direction',
        'controller.info' : './Info/src/controller.info',
        'controller.itemViewer' : './ItemViewer/src/controller.itemViewer',
        'controller.move' : './Move/src/controller.move',
    },
    output: {
        path: './_dist/',
        filename: '[name].js',
        libraryTarget: "umd",
        library: '[name]'
    },
    module: {
       loaders: [
            {
              test: /\.css$/,
              exclude: /node_modules/,
              loader: ["style-loader", "css-loader"]
            },
            {
              test: /\.less$/,
              exclude: /node_modules/,
              loader:  ["style-loader", "css-loader", "less-loader"]
            },
            {
              test: /\.(png|jpg)$/,
              exclude: /node_modules/,
              loader: 'url-loader'
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.json', '.less'],
        alias:{
        }
    },
    externals: {
        jquery: "jQuery"
    }
};
