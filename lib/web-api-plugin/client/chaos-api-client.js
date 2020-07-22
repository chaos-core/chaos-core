import axios from 'axios';

import {UserService} from './user';

export class ChaosApiClient {
  static async request(method, path, data = undefined) {
    const response = await axios({
      method: method,
      url: path,
      data: data,
      headers: {
        authorization: `bearer ${UserService.getJwt()}`,
      },
    });

    return response.data;
  }

  static async get(path, data) {
    return this.request('GET', path, data);
  }

  static async post(path, data) {
    return this.request('POST', path, data);
  }

  static async put(path, data) {
    return this.request('PUT', path, data);
  }

  static async delete(path, data) {
    return this.request('DELETE', path, data);
  }

  static async patch(path, data) {
    return this.request('PATCH', path, data);
  }

  static async login({code}) {
    return this.post('/api/login', {code});
  }

  static async getStatus() {
    return await this.get(`/api/status`);
  }

  static async getGuilds() {
    const data = await this.get(`/api/guilds`);
    return data.guilds;
  }

  static async getGuild({guildId}) {
    const data = await this.get(`/api/${guildId}`);
    return data.guild;
  }

  static async getChannels({guildId}) {
    const data = await this.get(`/api/${guildId}/channels`);
    return data.channels;
  }

  static async getRoles({guildId}) {
    const data = await this.get(`/api/${guildId}/roles`);
    return data.roles;
  }

  static async getMembers({guildId}) {
    const data = await this.get(`/api/${guildId}/members`);
    return data.members;
  }

  static async getGuildPlugins({guildId}) {
    const data = await this.get(`/api/${guildId}/plugins`);
    return data.plugins;
  }

  static async setPluginEnabled({guildId, pluginName, enabled}) {
    const data = await this.patch(
      `/api/${guildId}/plugins/${encodeURIComponent(pluginName)}`,
      {enabled},
    );
    return data.enabled;
  }

  static async getPluginActions({pluginName}) {
    const data = await this.get(`/api/plugins/${encodeURIComponent(pluginName)}/actions`);
    return data.actions;
  }

  static async runConfigAction({guildId, pluginName, actionName, args}) {
    const data = await this.post(
      `/api/${guildId}/plugins/${encodeURIComponent(pluginName)}/${encodeURIComponent(actionName)}`,
      {args},
    );
    return data.response;
  }
}
