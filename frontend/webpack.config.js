const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { env } = require('process');
const { transform } = require('ts-transform-react-jsx-source')

const PostCSSOptions = {
    postcssOptions: {
        plugins: [
            "postcss-aspect-ratio-polyfill",
            ["postcss-preset-env", { plugins: { autoprefixer: { flexbox: true } } }]
        ],
    },
};

module.exports = [
    {
        entry: "./src/index.tsx",
        mode: env.NODE_ENV || "development",
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: {
                        loader: 'ts-loader',
                        options: {
                            getCustomTransformers() {
                                return {
                                    before: [transform()],
                                };
                            },
                        },
                    },

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
                    ]
                },
                {
                    test: /\.scss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader",
                        "sass-loader",
                    ],
                },
                {
                    test: /\.(woff(2)?|ttf|eot|png|jpg|webp|avif)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: { outputPath: 'static/' }
                        }
                    ]
                },
                {
                    test: /\.svg$/i,
                    use: [
                        {
                            loader: 'file-loader',
                            options: { outputPath: 'static/' }
                        },
                        'xml-loader'
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
            fallback: { "crypto": false, "xmldom": false },
            alias: {
                "winjs": path.resolve(__dirname, './winjs'),
                "shared": path.resolve(__dirname, '../shared/src'),
                "static": path.resolve(__dirname, './static'),
            }
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: env.NODE_ENV === 'production' ? "[name].[chunkhash].css" : "[name].bundle.css",
                chunkFilename: env.NODE_ENV === 'production' ? "[id].bundle.[chunkhash].css" : "[id].bundle.css"
            }),
            new HtmlWebpackPlugin({ inject: true, template: "./src/index.html" })
        ],
        output: {
            filename: env.NODE_ENV === 'production' ? '[name].[chunkhash].js' : '[name].bundle.js',
            chunkFilename: env.NODE_ENV === 'production' ? '[id].bundle.[chunkhash].js' : '[id].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];