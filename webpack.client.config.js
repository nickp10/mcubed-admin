const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");
const webpack = require("webpack");

const APP_DIR = path.resolve(__dirname, "./src/client");
const BUILD_DIR = path.resolve(__dirname, "./build");

module.exports = {
    entry: {
        main: path.join(APP_DIR, "index.tsx")
    },
    output: {
        filename: "client.js",
        path: BUILD_DIR,
        publicPath: "/"
    },
    module: {
        rules: [
            {
                test: /\.(css)$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "typings-for-css-modules-loader",
                        query: {
                            modules: true,
                            namedExport: true
                        }
                    }
                ]
            },
            {
                test: /\.(ts|tsx)$/,
                loader: "ts-loader"
            },
            {
                test: /\.(js|jsx)$/,
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            cacheDirectory: true,
                            presets: ["react", "env"]
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx", ".css"]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(APP_DIR, "index.ejs"),
            inject: "body"
        }),
        new CopyWebpackPlugin([{
            from: path.join(APP_DIR, "images"),
            to: path.join(BUILD_DIR, "images")
        }])
    ]
};
