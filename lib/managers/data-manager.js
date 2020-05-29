const util = require('util');
const ChaosManager = require('../models/chaos-manager');
const { asPromise } = require('../utility');

class DataSourceError extends Error {
  constructor(message) {
    super(message);
    this.name = "DataSourceError";
  }
}

class DataManager extends ChaosManager {
  constructor(chaos) {
    super(chaos);

    this._dataSource = null;
    this._cache = {};

    this.setGuildData = this.setGuildData.bind(this);
    this.getGuildData = this.getGuildData.bind(this);

    this.setUserData = this.setUserData.bind(this);
    this.getUserData = this.getUserData.bind(this);

    this._prepareDataSource();
  }

  get type() {
    return this._dataSource.type;
  }

  /**
   *
   * @param guildId
   * @param keyword
   * @param data
   *
   * @return {Promise<Object>}
   */
  async setGuildData(guildId, keyword, data) {
    return this._setData('guild', guildId, keyword, data);
  }

  /**
   *
   * @param guildId
   *
   * @param keyword
   * @return {Promise<Object>}
   */
  async getGuildData(guildId, keyword) {
    return this._getData('guild', guildId, keyword);
  }

  /**
   * @param userId
   * @param keyword
   * @param data
   * @return {Promise<Object>}
   */
  async setUserData(userId, keyword, data) {
    return this._setData('user', userId, keyword, data);
  }

  /**
   * @param userId
   * @param keyword
   * @return {Promise<Object>}
   */
  async getUserData(userId, keyword) {
    return this._getData('user', userId, keyword);
  }

  _prepareDataSource() {
    let dataSourceConfig = this.chaos.config.dataSource || {};

    let DataSource;
    let dataSourceType = dataSourceConfig.type || 'memory';
    let npmPackageName = `chaos-data-${dataSourceType}`;

    try {
      DataSource = require(npmPackageName);
    } catch (error) {
      if (error.code === "MODULE_NOT_FOUND") {
        throw new DataSourceError(`Unable to load data source '${npmPackageName}'. Is the npm module '${npmPackageName}' installed?`);
      } else {
        throw error;
      }
    }

    this._dataSource = new DataSource(this.chaos, this.chaos.config.dataSource);
    this.chaos.logger.verbose(`Loaded data source ${npmPackageName}`);
  }

  async _getData(type, id, keyword) {
    let cacheKey = `${type}:${id}:${keyword}`;
    let cached = this._cache[cacheKey];

    if (cached && cached.expiresAt > Date.now()) {
      this.chaos.logger.data(`[cache]\t${cacheKey} => ${util.inspect(cached.data)}`);
      return cached.data;
    }

    let savedData = await asPromise(this._dataSource.getData(type, id, keyword));
    this.chaos.logger.data(`[read]\t${cacheKey} => ${util.inspect(savedData)}`);
    this._updateCache(cacheKey, savedData);
    return savedData;
  }

  async _setData(type, id, keyword, data) {
    let cacheKey = `${type}:${id}:${keyword}`;
    let savedData = await asPromise(this._dataSource.setData(type, id, keyword, data));
    this.chaos.logger.data(`[write]\t${cacheKey} => ${util.inspect(savedData)}`);
    this._updateCache(cacheKey, savedData);
    return savedData;
  }

  _updateCache(cacheKey, data) {
    this._cache[cacheKey] = {
      expiresAt: Date.now() + 300000, // 5 min in ms
      data,
    };
  }
}


module.exports = DataManager;
module.exports.DataSourceError = DataSourceError;
