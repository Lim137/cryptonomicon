const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
});
// module.exports = {
//   devServer: {
//     headers: {
//       "Access-Control-Allow-Origin": "*",
//       "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//       "Access-Control-Allow-Headers":
//         "Origin, X-Requested-With, Content-Type, Accept",
//     },
//     contentBase: "./src",
//   },
// };
// module.exports = {
//   configureWebpack: {
//     output: {
//       globalObject: "this",
//     },
//   },
// };
