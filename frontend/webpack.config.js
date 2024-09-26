const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const { env } = require('process');

module.exports = [
    {
        entry: {
            "index": "./src/index.tsx",
        },
        target: "browserslist",
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
                    test: /AppxManifest\.xml$/i,
                    use: ['manifest-loader']
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        'postcss-loader',
                    ]
                },
                {
                    test: /\.scss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        "postcss-loader",
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
                },
                {
                    test: /\.svg$/i,
                    use: [
                        { loader: 'file-loader', options: { outputPath: 'static/' } },
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
            runtimeChunk: 'single',
            usedExports: true,
            splitChunks: {
                chunks: "all",
                minSize: 4096
            }
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: { "crypto": false, "xmldom": false },
            alias: {
                "shared": path.resolve(__dirname, '../shared/src'),
                "static": path.resolve(__dirname, './static'),
                "packages": path.resolve(__dirname, '../packages'),
                "~": path.resolve(__dirname, './src'),
                "react": 'preact/compat',
                "react-dom": 'preact/compat',
            }
        },
        plugins: [
            new MiniCssExtractPlugin({
                filename: env.NODE_ENV === 'production' ? "[name].[chunkhash].css" : "[name].bundle.css",
                chunkFilename: env.NODE_ENV === 'production' ? "[id].bundle.[chunkhash].css" : "[id].bundle.css"
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: "./src/index.hbs",
                chunks: ["index"],
                filename: "views/index.hbs",
                publicPath: "/"
            }),
            new HtmlWebpackPlugin({
                inject: true,
                template: "./src/standalone.hbs",
                chunks: ["index"],
                filename: "views/standalone.hbs",
                publicPath: "/"
            }),
            new FaviconsWebpackPlugin({
                logo: './static/wam-circular.png',
                favicons: {
                    icons: { android: false, appleIcon: false, appleStartup: false, windows: false, yandex: false, }
                }
            })
        ],
        output: {
            filename: env.NODE_ENV === 'production' ? '[name].[chunkhash].js' : '[name].bundle.js',
            chunkFilename: env.NODE_ENV === 'production' ? '[id].bundle.[chunkhash].js' : '[id].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];