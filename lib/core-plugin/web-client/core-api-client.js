import {ChaosApiClient} from 'chaos-core/chaos-api-client.js';

export default class CoreApiClient extends ChaosApiClient {
  static async getPrefix({guildId}) {
    const data = await this.get(`/api/core/${guildId}/prefix`);
    return data.prefix;
  }

  static async setPrefix({guildId, prefix}) {
    const data = await this.put(`/api/core/${guildId}/prefix`, {prefix});
    return data.prefix;
  }

  static async getCommands({guildId}) {
    const data = await this.get(`/api/core/${guildId}/commands`);
    return data.commands;
  }

  static async setCommandEnabled({guildId, commandName, enabled}) {
    const data = await this.patch(
      `/api/core/${guildId}/commands/${encodeURIComponent(commandName)}`,
      {enabled},
    );
    return data.enabled;
  }
}
