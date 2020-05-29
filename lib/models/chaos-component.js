class ChaosComponent {
  constructor(chaos) {
    this._chaos = chaos;
    this.pluginName = null;
  }

  /**
   * The chaos bot that the component is bound to
   * @return {ChaosCore}
   */
  get chaos() {
    return this._chaos;
  }

  /**
   * Alias for easy access to the chaos logger
   * @returns {Logger}
   */
  get logger() {
    return this.chaos.logger;
  }

  /**
   * Alias for easy access to chaos strings
   * Recommended to override to allow for quicker access to related strings
   *
   * @returns {Object}
   */
  get strings() {
    return this.chaos.strings;
  }

  /**
   * Checks if the plugin the component belongs to is enabled in a guild
   * @param guild {Guild}
   * @return {Promise<boolean>}
   */
  async isPluginEnabled(guild) {
    if (!this.pluginName) return false;
    return this.getService('core', 'PluginService')
      .isPluginEnabled(guild.id, this.pluginName);
  }

  /**
   * Gets a piece of data from the guild data store
   * @param guildId {Snowflake} The Snowflake id of the guild to retrieve data for
   * @param key {String} The key that the data is stored under
   * @return {Promise<String|Number|Array|Object>} The stored data
   */
  async getGuildData(guildId, key) {
    return this.chaos.dataManager.getGuildData(guildId, key);
  }

  /**
   * Saves a piece of data to the guild data store
   * @param guildId {Snowflake} The Snowflake id of the guild to save data for
   * @param key {String} The key to store the data as
   * @param data {String|Number|Array|Object} The data to save
   * @return {Promise<String|Number|Array|Object>} The stored data
   */
  async setGuildData(guildId, key, data) {
    return this.chaos.dataManager.setGuildData(guildId, key, data);
  }

  /**
   * Loads a piece of data from the user data store. This data is shared across
   * all guilds the user is in.
   *
   * @param userId {Snowflake} The Snowflake id of the user to save data for
   * @param key {String} The key to store the data as
   * @return {Promise<String|Number|Array|Object>} The stored data
   */
  async getUserData(userId, key) {
    return this.chaos.dataManager.getUserData(userId, key);
  }

  /**
   * Saves a piece of data to the user data store. This data is shared across
   * all guilds the user is in.
   *
   * @param userId {Snowflake} The Snowflake id of the user to save data for
   * @param key {String} The key to store the data as
   * @param data {String|Number|Array|Object} The data to save
   * @return {Promise<String|Number|Array|Object>} The stored data
   */
  async setUserData(userId, key, data) {
    return this.chaos.dataManager.setUserData(userId, key, data);
  }

  /**
   * Retrieves an instance of a service
   *
   * @param pluginName {String} The name of the plugin the service is from
   * @param serviceName {String} The name of the service
   * @return {Promise<Service>} The instantiated service
   */
  getService(pluginName, serviceName) {
    return this.chaos.servicesManager.getService(pluginName, serviceName);
  }

  /**
   * Validates that the component has been loaded correctly.
   * @return {boolean}
   */
  validate() {
    return true;
  }
}

module.exports = ChaosComponent;
