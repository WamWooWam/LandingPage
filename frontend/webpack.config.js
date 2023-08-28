const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { env } = require('process');

module.exports = [
    {
        entry: {
            "index": "./src/index.tsx",
            "standalone": "./src/standalone.tsx",
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
                    test: /AppxManifest\.xml$/i,
                    use: ['manifest-loader']
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        "postcss-loader",
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
                    test: /\.(woff(2)?|ttf|eot|png|jpg|webp|avif|wasm)(\?v=\d+\.\d+\.\d+)?$/i,
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
            usedExports: true,
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
            fallback: { "crypto": false, "xmldom": false },
            alias: {
                "winjs": path.resolve(__dirname, './winjs'),
                "shared": path.resolve(__dirname, '../shared/src'),
                "static": path.resolve(__dirname, './static'),
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
            new HtmlWebpackPlugin({ inject: true, template: "./src/index.hbs", chunks: ["index"], filename: "views/index.hbs", publicPath: "/" }),
            new HtmlWebpackPlugin({ inject: true, template: "./src/standalone.hbs", chunks: ["standalone"], filename: "views/standalone.hbs", publicPath: "/" }),
        ],
        output: {
            filename: env.NODE_ENV === 'production' ? '[name].[chunkhash].js' : '[name].bundle.js',
            chunkFilename: env.NODE_ENV === 'production' ? '[id].bundle.[chunkhash].js' : '[id].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];