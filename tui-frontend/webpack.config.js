const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ProvidePlugin = require("webpack").ProvidePlugin;

module.exports = {
  mode: "development",
  entry: "./src/index",
  plugins: [
    new HtmlWebpackPlugin({
      title: "Typing test",
    }),
    new ProvidePlugin({
      $: "jquery",
    }),
  ],
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "dist"),
    clean: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["ts-loader"],
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /woff2$/,
        type: "asset/resource",
      },
    ],
  },
};
