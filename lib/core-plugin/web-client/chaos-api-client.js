import axios from 'axios';

import {UserService} from './user';

const ChaosApiClient = {
  request: async (method, path, data = undefined) => {
    const response = await axios({
      method: method,
      url: path,
      data: data,
      headers: {
        authorization: `bearer ${UserService.getJwt()}`,
      },
    });

    return response.data;
  },

  get: (path, data) => ChaosApiClient.request('GET', path, data),
  post: (path, data) => ChaosApiClient.request('POST', path, data),
  put: (path, data) => ChaosApiClient.request('PUT', path, data),
  delete: (path, data) => ChaosApiClient.request('DELETE', path, data),
  patch: (path, data) => ChaosApiClient.request('PATCH', path, data),
  login: ({code}) => ChaosApiClient.post('/api/login', {code}),

  guilds: {
    get: () => ChaosApiClient.get('/api/guilds')
      .then((data) => data.guilds),
  },

  guild: (guildId) => ({
    get: () => ChaosApiClient.get(`/api/guilds/${guildId}`)
      .then((data) => data.guild),
    getPlugins: () => ChaosApiClient.get(`/api/guilds/${guildId}/plugins`)
      .then((data) => data.plugins),
  }),

  plugin: (pluginName) => ({
    getActions: () => ChaosApiClient.get(`/api/plugin/${pluginName}/actions`)
      .then((data) => data.actions),
    setEnabled: (guildId, enabled) => ChaosApiClient.post(
      `api/plugin/${pluginName}/enabled`,
      {guildId, enabled},
    ).then((data) => data.enabled),
    runAction: (actionName, guildId, args) => ChaosApiClient.post(
      `/api/plugin/${encodeURIComponent(pluginName)}/actions/${encodeURIComponent(actionName)}`,
      {guildId, args},
    ).then((data) => data),
  }),
};

export default ChaosApiClient;
