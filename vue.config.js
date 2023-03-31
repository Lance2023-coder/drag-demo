/*
 * @Author: zhuotuo
 * @Date: 2023-03-30 08:38:22
 * @LastEditors: zhuotuo
 * @LastEditTime: 2023-03-30 14:41:25
 * @Description: 
 */
const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.NODE_ENV === 'production'
    ? '/drag-demo/'
    : '/'
})
