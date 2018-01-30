const fs = require('fs')
const { resolve } = require('path')
const axios = require('axios')
const yaml = require('js-yaml').safeLoad
const debug = require('debug')('nuxt:swagger')

module.exports = async function module (_moduleOptions) {
  // Combine options
  const moduleOptions = Object.assign({}, this.options.swagger, _moduleOptions)

  // Apply defaults
  const options = Object.assign(
    {
      url: '',
      file: '',
      spec: {}
    },
    moduleOptions
  )

  // Load spec from url
  if (options.url !== '') {
    debug(
      `Swagger Spec URL: ${options.url}`
    )
    const res = await axios.get(options.url)
    options.spec = res.data
  }

  // Load spec from file
  if (options.file !== '') {
    debug(
      `Swagger Spec File: ${options.file}`
    )
    const content = fs.readFileSync(options.file, 'utf-8')
    try {
      options.spec = JSON.parse(content)
    } catch (e) {
      options.spec = yaml(content)
    }
  }

  // Register plugin
  this.addPlugin({
    src: resolve(__dirname, './templates/plugin.js'),
    fileName: 'swagger.js',
    options
  })
}

module.exports.meta = require('../package.json')
