const { resolve } = require('path')
const axios = require('axios')
const debug = require('debug')('nuxt:swagger')

module.exports = async function module (moduleOptions) {
  const options = Object.assign({}, moduleOptions)

  // TODO
  const url = 'http://localhost:3000/swagger'

  debug(
    `Swagger Spec URL: ${url}`
  )

  return axios.get(url)
    .then(res => {
      options.spec = res.data

      this.addPlugin({
        src: resolve(__dirname, './templates/plugin.js'),
        fileName: 'swagger-module.js',
        options
      })
    })
}
