const Service = require('../../models/service');
const {ChaosError} = require('../../errors');

const ID_REGEX = /<#(\d+)>/;

class GuildService extends Service {
  /**
   * Attempt to find a channel in a guild.
   *
   * The channelString can be one of the following:
   * - a case insensitive channel name: "awesome-channel"
   * - a channel mention: "<#131231243142>"
   *
   * @param guild {Guild} The guild to search
   * @param channelString {String} The name or mention of the channel to find
   *
   * @return {Promise<GuildMember>}
   */
  async findChannel(guild, channelString) {
    const channelIdMatches = channelString.match(ID_REGEX);

    let channel;
    if (channelIdMatches) {
      const channelId = channelIdMatches[1];
      channel = guild.channels
        .find((channel) => channel.id === channelId);
    } else {
      channel = guild.channels
        .find((channel) => channel.name.toLowerCase() === channelString.toLowerCase());
    }

    if (channel) {
      return channel;
    } else {
      throw new ChaosError(`The channel '${channelString}' could not be found`);
    }
  }

  /**
   * Attempts to find a member of a guild.
   * @see {UserService.findMember}
   *
   * @return {Promise<GuildMember>}
   */
  async findMember(guild, userString) {
    return this.getService('core', 'UserService')
      .findMember(guild, userString);
  }
}

module.exports = GuildService;
