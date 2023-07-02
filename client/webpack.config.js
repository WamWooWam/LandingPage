const path = require('path');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

module.exports = [
    {
        entry: "./src/index.tsx",
        mode: "production",
        devtool: 'source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
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
                    test: /\.(woff(2)?|ttf|eot|svg|png|jpg|webp|avif)(\?v=\d+\.\d+\.\d+)?$/,
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
                    test: /\.xml$/i,
                    use: ['raw-loader']
                },
                {
                    test: /AppxManifest\.xml$/i,
                    use: ['manifest-loader']
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        optimization: {
            minimizer: [
                `...`,
                new CssMinimizerPlugin(),
            ],
        },
        plugins: [new MiniCssExtractPlugin()],
        output: {
            filename: 'index.js',
            path: path.resolve(__dirname, 'dist'),
        }
    }];