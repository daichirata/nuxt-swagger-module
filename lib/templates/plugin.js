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
    <% _.forEach(options.spec.paths, function ($_api, $_path) { %>
      <% _.forEach($_api, function ($_req, $_method) { %>

        <% const consume = ($_req.consumes || [])[0] || (options.spec.consumes || [])[0] %>

        <%= $_req.operationId %>: async (params = {}) => {
          let path = '<%= $_path %>'
          let body
          const headers = {}
          const pathParams = {}
          const queryParams = {}
          const formParams = new FormData()

          <% _.forEach($_req.parameters, function ($_param) { %>
            <% if ($_param.required === true) { %>
              if (params['<%= $_param.name %>'] === undefined) {
                throw new Error("Missing required parameter '<%= $_param.name %>' when calling <%= $_req.operationId %>")
              }
            <% } %>

            if (params['<%= $_param.name %>'] !== undefined) {
              <% if ($_param.in === "query") { %>
                queryParams['<%= $_param.name %>'] = params['<%= $_param.name %>']
              <% } %>

              <% if ($_param.in === "path") { %>
                pathParams['<%= $_param.name %>'] = params['<%= $_param.name %>']
              <% } %>

              <% if ($_param.in === "header") { %>
                headers['<%= $_param.name %>'] = params['<%= $_param.name %>']
              <% } %>

              <% if ($_param.in === "body") { %>
                body = params['<%= $_param.name %>']
              <% } %>

              <% if ($_param.in === "formData") { %>
                <% if ($_param.type === "file") { %>
                  if (params['<%= $_param.name %>'].file !== undefined) {
                    formParams.append('<%= $_param.name %>', params['<%= $_param.name %>'].file, params['<%= $_param.name %>'].name)
                  } else {
                    formParams.append('<%= $_param.name %>', params['<%= $_param.name %>'])
                  }
                <% } else { %>
                  formParams.append('<%= $_param.name %>', params['<%= $_param.name %>'])
                <% } %>
              <% } %>
            }
          <% }) %>

          for (const key of Object.keys(pathParams)) {
            path = path.replace('{'+key+'}', pathParams[key].toString())
          }

          <% if (consume === 'application/x-www-form-urlencoded') { %>
            const data = [...formParams.entries()].map(e => encodeURIComponent(e[0]) + "=" + encodeURIComponent(e[1])).join('&')
          <% } else { %>
            const data = formParams
          <% } %>

          return request('<%= $_method %>', path, queryParams, body || data, headers)
        },
      <% }) %>
    <% }) %>
  }

  inject('api', api)
}
