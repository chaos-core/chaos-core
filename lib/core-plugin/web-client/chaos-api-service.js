import axios from 'axios';

import {UserService} from './user';

const ApiClient = {
  request: async (method, path, data = undefined) => {
    const response = await axios({
      method: method,
      url: path,
      data: data,
      headers: {authorization: `bearer ${UserService.getJwt()}`},
    });

    return response.data;
  },

  get: (path, data) => ApiClient.request('GET', path, data),
  post: (path, data) => ApiClient.request('POST', path, data),
  put: (path, data) => ApiClient.request('PUT', path, data),
  delete: (path, data) => ApiClient.request('DELETE', path, data),
  patch: (path, data) => ApiClient.request('PATCH', path, data),
};

const ChaosApiService = {
  request: ApiClient.request,

  get: ApiClient.get,
  post: ApiClient.post,
  put: ApiClient.put,
  delete: ApiClient.delete,
  patch: ApiClient.patch,

  login: ({code}) => ApiClient.post('/api/login', {code}),

  guilds: {
    get: () => ApiClient.get('/api/guilds')
      .then((data) => data.guilds),
  },

  guild: (guildId) => ({
    get: () => ApiClient.get(`/api/guilds/${guildId}`)
      .then((data) => data.guild),
    getPlugins: () => ApiClient.get(`/api/guilds/${guildId}/plugins`)
      .then((data) => data.plugins),
  }),

  plugin: (pluginName) => ({
    getActions: () => ApiClient.get(`/api/plugin/${pluginName}/actions`)
      .then((data) => data.actions),
  }),
};

export default ChaosApiService;
