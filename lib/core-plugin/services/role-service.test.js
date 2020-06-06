const Discord = require('discord.js');

const RoleService = require('./role-service');
const { RoleNotFoundError } = require("../../errors");
const createChaosStub = require('../../test/create-chaos-stub');

describe('Service: RoleService', function () {
  beforeEach(function () {
    this.chaos = createChaosStub();
    this.roleService = new RoleService(this.chaos);
  });

  describe('#findRole', function () {
    const roleId = '000001';
    const roleName = 'testRole';

    beforeEach(function () {
      this.guild = {
        roles: new Discord.Collection(),
      };
    });

    Object.entries({
      "a role id": roleId,
      "a basic role mention": `<@${roleId}>`,
      "an alternate role mention": `<@&${roleId}>`,
      "a role name": roleName,
    }).forEach(([roleStringType, roleString]) => {
      context(`when the roleString is a ${roleStringType}`, function () {
        context('when the role does not exist', function () {
          it('throws a RoleNotFoundError', async function () {
            try {
              await this.roleService.findRole(this.guild, roleString);
            } catch (error) {
              if (error instanceof RoleNotFoundError) {
                expect(error.message).to.eq(`The role '${roleString}' could not be found`);
                return;
              } else {
                throw error;
              }
            }

            throw new Error('Error was not raised');
          });
        });

        context('when the role exists in the guild', function () {
          beforeEach(function () {
            this.role = {
              guild: this.guild,
              id: roleId,
              name: roleName,
            };
            this.guild.roles.set(this.role.id, this.role);
          });

          it('emits the found member', async function () {
            let role = await this.roleService.findRole(this.guild, roleString);
            expect(role).to.eq(this.role);
          });
        });
      });
    });
  });
});
