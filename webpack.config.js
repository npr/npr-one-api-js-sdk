var webpack = require('webpack'); // eslint-disable-line no-var

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = process.env.ENV = 'production';
}
var ENV = process.env.NODE_ENV; // eslint-disable-line no-var


module.exports = {
    devtool: 'source-map',
    debug: ENV !== 'production',
    entry: {
        'npr-one-sdk': ['./src/index.js'],
        'npr-one-sdk.min': ['./src/index.js']
    },
    output: {
        path: './dist/browser',
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'NprOneSDK'
    },
    module:{
        loaders: [
            { test: /\.js$/, loaders: [ 'babel-loader', 'eslint-loader' ], exclude: /node_modules/ },
        ]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.OccurenceOrderPlugin(true),
        new webpack.optimize.UglifyJsPlugin({
            include: /\.min\.js$/,
            minimize: true,
            beautify: false,
            mangle: {
                screw_ie8: true
            },
            compress: {
                screw_ie8: true
            },
            comments: false
        })
    ]
};
