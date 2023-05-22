const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer');

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const optimization = () => {

    const config = {
        splitChunks: {
            chunks: "all",
        }
    }

    if (isProduction) {
        config.minimizer = [
            new TerserPlugin(),
            new CssMinimizerPlugin(),
        ]
    }

    return config;
}

const filename = (ext) => {
    return isDevelopment ? `[name].${ext}` : `[name].[hash].${ext}`;
}

const cssLoaders = (ext) => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                // hrm: isDevelopment,
                // reloadAll: true,
            },
        },
        'css-loader'
    ];

    if (ext) {
        loaders.push(ext);
    }

    return loaders;
}

const plugins = () => {
    const base = [
        new HTMLWebpackPlugin({
            template: "./index.html",
            minify: {
                collapseWhitespace: isProduction,
            }
        }),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/assets/images'),
                    to: path.resolve(__dirname, 'dist/assets/images'),
                },
                // {
                //     from: path.resolve(__dirname, 'src/libs'),
                //     to: path.resolve(__dirname, 'dist/libs'),
                // }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css'),
        })
    ];

    if (isProduction) {
        base.push(new BundleAnalyzerPlugin());
    }

    return base;
}

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        index: ['./assets/js/index.js'],
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: optimization(),
    devServer: {
        port: 4200,
        hot: isDevelopment,
    },
    devtool: isDevelopment ? 'inline-source-map' : undefined,
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.css$/,
                use: cssLoaders(),
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader'),
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
}
