export default (ctx, inject) => {
  const request = (method, url, params = {}, data = {}, headers = {}, requestConfig = {}) => {
    const config = {
      // `url` is the server URL that will be used for the request
      url,

      // `method` is the request method to be used when making the request
      method: method.toLowerCase(),

      // `headers` are custom headers to be sent
      headers,

      // `params` are the URL parameters to be sent with the request
      // Must be a plain object or a URLSearchParams object
      params,

      // `data` is the data to be sent as the request body
      // Only applicable for request methods 'PUT', 'POST', and 'PATCH'
      // When no `transformRequest` is set, must be of one of the following types:
      // - string, plain object, ArrayBuffer, ArrayBufferView, URLSearchParams
      // - Browser only: FormData, File, Blob
      // - Node only: Stream, Buffer
      data,
    }
    return ctx.$axios.request(Object.assign(requestConfig, config))
  }

  const api = {
    <% _.forEach(options.spec.paths, function (api, path) { %>
      <% _.forEach(api, function (req, method) { %>
        <%= req.operationId %> (params = {}) {
          let path = '<%= path %>'
          let data = {}
          const headers = {}
          const queryParams = {}

          <% _.forEach(req.parameters, function (param) { %>
            <% if (param.required === true) { %>
              if (params['<%= param.name %>'] === undefined) {
                return Promise.reject(new Error('Missing required parameter: <%= param.name %>'))
              }
            <% } %>

            <% if (param.in === "query") { %>
              if (params['<%= param.name %>'] !== undefined) {
                queryParams['<%= param.name %>'] = params['<%= param.name %>']
              }
            <% } %>

            <% if (param.in === "path") { %>
              path = path.replace('{<%= param.name %>}', params['<%= param.name %>'].toString())
            <% } %>

            <% if (param.in === "header") { %>
              if (params['<%= param.name %>'] !== undefined) {
                headers['<%= param.name %>'] = params['<%= param.name %>']
              }
            <% } %>

            <% if (param.in === "body") { %>
              if (params['<%= param.name %>'] !== undefined) {
                data = params['<%= param.name %>']
              }
            <% } %>

            <% if (param.in === "form") { %>
              if (params['<%= param.name %>'] !== undefined) {
                data['<%= param.name %>'] = params['<%= param.name %>']
              }
            <% } %>
          <% }) %>

          if (params.$queryParams) {
            Object.keys(params.$queryParams).forEach(function(paramName) {
              queryParams[paramName] = params.$queryParams[paramName]
            });
          }

          return request('<%= method %>', path, queryParams, data, headers)
        },
      <% }) %>
    <% }) %>
  }

  inject('api', api)
}
