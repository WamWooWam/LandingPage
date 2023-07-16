const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { env } = require('process');

module.exports = [
    {
        entry: "./src/index.tsx",
        mode: env.NODE_ENV || "development",
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
                {
                    test: /AppxManifest\.xml$/i,
                    use: ['manifest-loader']
                },
                {
                    test: /\.css$/i,
                    use: [
                        "style-loader",
                        "css-loader"
                    ]
                },
                {
                    test: /\.scss$/i,
                    use: [
                        "style-loader",
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|png|jpg|webp|avif)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                outputPath: 'static/'
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                outputPath: 'static/'
                            }
                        },
                        {
                            loader: 'xml-loader'
                        }
                    ]
                },
                {
                    test: /StartScreen\.xml$/i,
                    use: ['raw-loader', 'xml-loader']
                },
            ],
        },
        optimization: {
            usedExports: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: { "crypto": false, "xmldom": false }
        },
        plugins: [new HtmlWebpackPlugin({
            inject: true,
            template: "./src/index.html"
        })],
        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];