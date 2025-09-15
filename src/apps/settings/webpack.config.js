const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { env } = require('process');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        "index": "./src/index.tsx",
    },
    target: "web",
    mode: env.NODE_ENV || "development",
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ['ts-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.css$/i,
                use: [
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                ]
            },
            {
                test: /\.scss$/i,
                use: [
                    { loader: 'css-loader', options: { importLoaders: 1 } },
                    "sass-loader",
                ],
            },
            {
                test: /\.(png|jpg|gif|webp|avif)$/i,
                use: [
                    { loader: 'url-loader', options: { limit: 4096, fallback: { loader: 'file-loader', options: { outputPath: 'static/' } } } },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|wasm)(\?v=\d+\.\d+\.\d+)?$/i,
                use: [
                    { loader: 'file-loader', options: { outputPath: 'static/' } }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].bundle.css",
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: "./src/index.html",
            chunks: ["index"],
            filename: "index.html",
            baseUrl: "/apps/calculator",
            scriptLoading: 'module'
        }),
    ],
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        library: {
            type: "modern-module"
        }
    },
    experiments: {
        outputModule: true,
    },
};