const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: '/drag-demo/',
  outputDir: 'docs',
  assetsDir: 'drag-demo'
})
