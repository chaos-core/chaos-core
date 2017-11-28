const Discord = require('discord.js');

const Factory = require('../support/factory');

Factory.define('Role', (options) => {
  let data = Object.assign({
    id: Factory.sequence((i) => `roleId-${i}`),
    permissions: 0,
  }, options);

  if (!data.client) {
    data.client = new Discord.Client();
  }

  if (!data.guild) {
    data.guild = Factory.create('Guild');
  }


  let role = new Discord.Role(data.client, data, data.guild);

  //stub out networked methods


  return role;
});
