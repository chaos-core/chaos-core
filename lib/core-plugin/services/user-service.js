const { DiscordAPIError } = require('discord.js');

const Service = require('../../models/service');
const { UserNotFoundError, AmbiguousUserError } = require('../../errors');

const ID_REGEX = /<@!?(\d+)>|^(\d+)$/;

class UserService extends Service {
  /**
   * Attempt to find a member in a guild by a userString.
   *
   * The user string can be one of the following:
   * - an user mention: "<@!123132312412>" or"<@131231243142>"
   * - an userId: "131231243142"
   * - an user tag: "exampleUser#1234"
   * - an user's username: "exampleUser"
   * - an user's nickname: "exampleNickname"
   *
   * @param guild {Guild}
   * @param userString {String}
   *
   * @return {Promise<GuildMember>}
   */
  async findMember(guild, userString) {
    const userIdMatches = userString.match(ID_REGEX);

    let user;
    if (userIdMatches) {
      const userID = userIdMatches[1] || userIdMatches[2];
      user = guild.members.array().find((member) => member.user.id === userID);
    } else {
      let members = this._findMembersByString(guild, userString);
      switch (members.length) {
        case 0:
          user = null;
          break;
        case 1:
          user = members[0];
          break;
        default:
          throw new AmbiguousUserError(`'${userString}' matched to multiple users. Please specify the user by mention, or ID`);
      }
    }

    if (user) {
      return user;
    } else {
      throw new UserNotFoundError(`The user '${userString}' could not be found`);
    }
  }

  /**
   * Attempt to find a user in any guild by a userString.
   *
   * The user string can be one of the following:
   * - a user mention: "<@!123132312412>" or "<@131231243142>"
   * - a userId: "131231243142"
   * - a user tag: "exampleUser#1234"
   *
   * Note: Attempting to find a user by user tag is slow and unreliable. Finding
   * by mention or userId is preferred.
   *
   * @param userString {String}
   *
   * @return {Promise<User>}
   */
  async findUser(userString) {
    const userIdMatches = userString.match(ID_REGEX);

    let user;
    if (userIdMatches) {
      let userId = userIdMatches[1] || userIdMatches[2];
      user = await this.findUserById(userId);
    } else {
      user = this.chaos.discord.users.find((user) => user.tag === userString);
    }

    if (user) {
      return user;
    } else {
      throw new UserNotFoundError(`The user '${userString}' could not be found`);
    }
  }

  async findUserById(userId) {
    try {
      return await this.chaos.discord.fetchUser(userId);
    } catch (error) {
      if (
        error instanceof DiscordAPIError &&
        error.message === 'Unknown User'
      ) {
        return null;
      } else {
        throw error;
      }
    }
  }

  _findMembersByString(guild, userString) {
    return guild.members.array().filter((member) => {
      return (
        this._tagMatches(member, userString) ||
        this._usernameMatches(member, userString) ||
        this._nicknameMatches(member, userString)
      );
    });
  }

  _tagMatches(member, tag) {
    if (member.user.tag) {
      return member.user.tag.toLowerCase() === tag.toLowerCase();
    } else {
      return false;
    }
  }

  _usernameMatches(member, username) {
    if (member.user.tag) {
      return member.user.username.toLowerCase() === username.toLowerCase();
    } else {
      return false;
    }
  }

  _nicknameMatches(member, nickname) {
    if (member.nickname) {
      return member.nickname.toLowerCase() === nickname.toLowerCase();
    } else {
      return false;
    }
  }
}

module.exports = UserService;
