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
}

export class CoreApiClient extends ChaosApiClient {
  static get baseUrl() {
    return `/api/core`;
  }

  static async getPrefix({guildId}) {
    const data = await this.get(`${this.baseUrl}/${guildId}/prefix`);
    return data.prefix;
  }

  static async setPrefix({guildId, prefix}) {
    const data = await this.put(`${this.baseUrl}/${guildId}/prefix`, {prefix});
    return data.prefix;
  }

  static async getCommands({guildId}) {
    const data = await this.get(`${this.baseUrl}/${guildId}/commands`);
    return data.commands;
  }

  static async setCommandEnabled({guildId, commandName, enabled}) {
    const data = await this.patch(
      `${this.baseUrl}/${guildId}/commands/${encodeURIComponent(commandName)}`,
      {enabled},
    );
    return data.enabled;
  }

  static async getGuilds() {
    const data = await this.get(`${this.baseUrl}/guilds`);
    return data.guilds;
  }

  static async getPluginActions({pluginName}) {
    const data = await this.get(`${this.baseUrl}/${encodeURIComponent(pluginName)}/actions`);
    return data.actions;
  }

  static async getGuild({guildId}) {
    const data = await this.get(`${this.baseUrl}/${guildId}`);
    return data.guild;
  }

  static async getGuildPlugins({guildId}) {
    const data = await this.get(`${this.baseUrl}/${guildId}/plugins`);
    return data.plugins;
  }

  static async setPluginEnabled({guildId, pluginName, enabled}) {
    const data = await this.patch(
      `${this.baseUrl}/${guildId}/plugins/${encodeURIComponent(pluginName)}`,
      {enabled},
    );
    return data.enabled;
  }

  static async runConfigAction({guildId, pluginName, actionName, args}) {
    const data = await this.post(
      `${this.baseUrl}/${guildId}/actions/${encodeURIComponent(pluginName)}/${encodeURIComponent(actionName)}`,
      {args},
    );
    return data.response;
  }
}
