const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  outputDir: "bookmark",
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      require('unplugin-element-plus/webpack')({
        useSource: false
      }),
    ],
  },
})
