const CleanWebpackPlugin = require('clean-webpack-plugin');
const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
    devtool: 'source-map',
    entry: {
        'npr-one-sdk': ['./src/index.ts'],
        'npr-one-sdk.min': ['./src/index.ts'],
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
        extensions: [ '.ts', '.js' ],
    },
    output: {
        path: path.resolve(__dirname, 'dist', 'browser'),
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'NprOneSDK',
    },
    plugins: [
        new CleanWebpackPlugin([path.resolve(__dirname, 'dist', 'browser')]),
        new UglifyJsPlugin({
            include: /\.min\.js$/,
            sourceMap: true,
            uglifyOptions: {
                ecma: 5,
                ie8: false,
                output: {
                    comments: false,
                    beautify: false,
                },
            },
        }),
    ],
};
