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
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [
                                        "postcss-aspect-ratio-polyfill",
                                        ["postcss-preset-env", { plugins: { autoprefixer: { flexbox: true } } }]
                                    ],
                                },
                            },
                        }],
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
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: { "crypto": false, "xmldom": false }
        },
        optimization: {
            minimizer: [
                `...`,
                new CssMinimizerPlugin(),
            ],
        },
        plugins: [new MiniCssExtractPlugin(), new HtmlWebpackPlugin({
            inject: true,
            template: "./src/index.html"
        })],
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];