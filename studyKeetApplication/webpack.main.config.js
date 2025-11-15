module.exports = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main.js",
  // Put your normal webpack config below here
  module: {
    rules: require("./webpack.rules"),
  },
  devServer: {
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; connect-src 'self' http://127.0.0.1:8000",
    },
  },
};
