const Discord = require('discord.js');

const Factory = require('../../support/factory');

Factory.define('Role', (options) => {
  let data = Object.assign({
    id: Factory.sequence((i) => `roleId-${i}`),
    permissions: 0,
  }, options);

  if (!data.guild) {
    data.guild = Factory.create('Guild');
  }


  let role = data.guild.roles.create(data);

  //stub out networked methods


  return role;
});
