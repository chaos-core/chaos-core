const Discord = require('discord.js');
const { SnowflakeUtil } = require('discord.js');

const UserService = require('./user-service');
const { UserNotFoundError } = require("../../errors");
const createChaosStub = require('../../test/create-chaos-stub');
const { AmbiguousUserError } = require("../../errors");

describe('Service: UserService', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.userService = new UserService(this.chaos);
  });

  describe('#findMember', function () {
    const memberId = Discord.SnowflakeUtil.generate();
    const memberUsername = 'TestUser';
    const memberTag = memberUsername + '#0001';
    const memberNickname = 'TestNickname';

    beforeEach(function () {
      this.guild = {
        members: new Discord.Collection(),
      };
    });

    context('when the member does not exist', function () {
      it('throws a UserNotFoundError', async function () {
        try {
          await this.userService.findMember(this.guild, "nullUser");
        } catch (error) {
          if (error instanceof UserNotFoundError) {
            expect(error.message).to.eq(`The user 'nullUser' could not be found`);
            return;
          } else {
            throw error;
          }
        }

        throw new Error('Error was not raised');
      });
    });

    context('when the member exists in the guild', function () {
      beforeEach(function () {
        this.user = {
          id: memberId,
          tag: memberTag,
          username: memberUsername,
        };

        this.member = {
          guild: this.guild,
          nickname: memberNickname,
          user: this.user,
        };

        this.chaos.discord.users.set(this.user.id, this.user);
        this.guild.members.set(this.member.id, this.member);
      });

      Object.entries({
        "an user's id": memberId,
        "an user mention": `<@${memberId}>`,
        "an alt user mention": `<@!${memberId}>`,
        "an user's tag": memberTag,
      }).forEach(([userStringType, userString]) => {
        context(`when the userString is ${userStringType}`, function () {
          it('emits the found member', async function () {
            let member = await this.userService.findMember(this.guild, userString);
            expect(member).to.eq(this.member);
          });
        });
      });

      context("when the userString is an user's username", function () {
        it('emits the found member', async function () {
          let member = await this.userService.findMember(this.guild, memberUsername);
          expect(member).to.eq(this.member);
        });

        context('when multiple users have the same username', function () {
          beforeEach(function () {
            this.otherUser = {
              id: SnowflakeUtil.generate(),
              tag: memberUsername + "#0002",
              username: memberUsername,
            };

            this.otherMember = {
              id: this.otherUser.id,
              guild: this.guild,
              user: this.otherUser,
            };

            this.chaos.discord.users.set(this.otherUser.id, this.otherUser);
            this.guild.members.set(this.otherMember.id, this.otherMember);
          });

          it('emits an error', async function () {
            try {
              await this.userService.findMember(this.guild, memberUsername);
            } catch (error) {
              if (error instanceof AmbiguousUserError) {
                expect(error.message).to.include("'TestUser' matched to multiple users.");
                return;
              } else {
                throw error;
              }
            }

            throw new Error('Error was not raised');
          });
        });
      });

      context(`when the userString is an user's nickname`, function () {
        it('emits the found member', async function () {
          let member = await this.userService.findMember(this.guild, memberNickname);
          expect(member).to.eq(this.member);
        });

        context('when multiple users have the same nickname', function () {
          beforeEach(function () {
            this.otherUser = {
              id: SnowflakeUtil.generate(),
              tag: "otherUser#0001",
              username: memberUsername,
            };

            this.otherMember = {
              id: this.otherUser.id,
              guild: this.guild,
              nickname: memberNickname,
              user: this.user,
            };

            this.chaos.discord.users.set(this.otherUser.id, this.otherUser);
            this.guild.members.set(this.otherMember.id, this.otherMember);
          });

          it('emits an error', async function () {
            try {
              await this.userService.findMember(this.guild, memberNickname);
            } catch (error) {
              if (error instanceof AmbiguousUserError) {
                expect(error.message).to.include("'TestNickname' matched to multiple users.");
                return;
              } else {
                throw error;
              }
            }

            throw new Error('Error was not raised');
          });
        });
      });
    });
  });

  describe('#findUser', function () {
    const userId = Discord.SnowflakeUtil.generate();
    const userTag = 'TestUser#0001';

    Object.entries({
      "an user id": userId,
      "an user mention": `<@${userId}>`,
      "an alt user mention": `<@!${userId}>`,
      "an user tag": userTag,
    }).forEach(([userStringType, userString]) => {
      context(`when the userString is a ${userStringType}`, function () {
        context('when the user does not exist', function () {
          it('throws a UserNotFoundError', async function () {
            try {
              await this.userService.findUser(userString);
            } catch (error) {
              expect(error).to.be.an.instanceOf(UserNotFoundError);
              expect(error.message).to.eq(`The user '${userString}' could not be found`);
              return;
            }

            throw new Error('Error was not raised');
          });
        });

        context('when the user exists', function () {
          beforeEach(function () {
            this.user = {
              id: userId,
              tag: userTag,
            };
            this.chaos.discord.users.set(this.user.id, this.user);
          });

          it('emits the found user', async function () {
            let user = await this.userService.findUser(userString);
            expect(user).to.eq(this.user);
          });
        });
      });
    });
  });
});
