const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  outputDir: 'bookmark',
  transpileDependencies: true,
  productionSourceMap: false,
  configureWebpack: {
    performance: {
      hints: false,
    },
    plugins: [
      require('unplugin-element-plus/webpack')({
        useSource: false,
      }),
    ],
    optimization: {
      splitChunks: {
        cacheGroups: {
          elementPlus: {
            test: /[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/,
            name: 'chunk-element-plus',
            priority: 20,
            chunks: 'all',
          },
        },
      },
    },
  },
  css: {
    extract: {
      ignoreOrder: true,
    },
  },
})
