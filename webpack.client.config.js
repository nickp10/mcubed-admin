const CopyWebpackPlugin = require("copy-webpack-plugin");
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
                    "style-loader",
                    "@teamsupercell/typings-for-css-modules-loader",
                    {
                        loader: "css-loader",
                        options: {
                            modules: true
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
                            presets: ["@babel/preset-react", "@babel/preset-env"]
                        }
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".json", ".ts", ".tsx", ".css"],
        fallback: {
            "crypto": require.resolve("crypto-js"),
            "querystring": require.resolve("querystring-es3")
        }
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.join(APP_DIR, "images"),
                    to: path.join(BUILD_DIR, "images")
                }
            ]
        })
    ]
};
