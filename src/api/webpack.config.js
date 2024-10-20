const webpack = require('webpack');
const path = require('path');

module.exports = {
    entry: {
        api: [path.join(__dirname, "src/index.ts")]
    },
    mode: 'production',
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader'
        },
        {
            test: /\.css$/i,
            use: ["css-loader"],
        },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        modules: [path.resolve(__dirname, 'src'), 'node_modules'],
        alias: {
            "src": path.resolve(__dirname, './src')
        }
    },
    target: "web",
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, './dist'),
        library: 'api'
    },
    plugins: [
        new webpack.DllPlugin({
            name: '[name]',
            entryOnly: true,
            context: path.resolve("/"),
            path: path.resolve(__dirname, './dist/manifest.[name].json')
        })
    ]
};