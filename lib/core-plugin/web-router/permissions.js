const express = require('express');
const {requireInGuild, requireChaosPermission} = require('../../web-api-plugin/server/middleware.js');
const router = express.Router();

router.get('/:guildId/permissions', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const permissionsService = req.chaos.getService('core', 'PermissionsService');

      const permissions = {};
      await Promise.all(
        permissionsService.levels.map((level) => permissionsService.getPermissionsData(req.guild.id, level)),
      ).then((levels) => levels.forEach((levelPerms) => {
        permissions[levelPerms.name] = levelPerms;
      }));

      res.send({permissions});
    } catch (error) {
      next(error);
    }
  },
]);

router.post('/:guildId/permissions/grant', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const permissionsService = req.chaos.getService('core', 'PermissionsService');
      const level = req.body.level;
      const roleId = req.body.roleId;
      const userId = req.body.userId;

      if (!level) {
        res.send({status: 400, error: "permission level is required"});
        return;
      }

      if (roleId) {
        const role = req.guild.roles.find((role) => role.id === roleId);
        await permissionsService.addRole(req.guild, level, role);
      } else if (userId) {
        const member = req.guild.members.find((member) => member.id === userId);
        await permissionsService.addUser(req.guild, level, member);
      } else {
        res.send({status: 400, error: "userId or roleId is required"});
        return;
      }

      const permissions = await permissionsService.getPermissionsData(req.guild.id);
      res.send({permissions});
    } catch (error) {
      next(error);
    }
  },
]);

router.post('/:guildId/permissions/revoke', [
  requireInGuild((req) => req.params.guildId),
  requireChaosPermission('admin'),
  async (req, res, next) => {
    try {
      const permissionsService = req.chaos.getService('core', 'PermissionsService');
      const level = req.body.level;
      const roleId = req.body.roleId;
      const userId = req.body.userId;

      if (!level) {
        res.send({status: 400, error: "permission level is required"});
        return;
      }

      if (roleId) {
        const role = req.guild.roles.find((role) => role.id === roleId);
        await permissionsService.removeRole(req.guild, level, role);
      } else if (userId) {
        const member = req.guild.members.find((member) => member.id === userId);
        await permissionsService.removeUser(req.guild, level, member);
      } else {
        res.send({status: 400, error: "userId or roleId is required"});
        return;
      }

      const permissions = await permissionsService.getPermissionsData(req.guild.id);
      res.send({permissions});
    } catch (error) {
      next(error);
    }
  },
]);

module.exports = router;
