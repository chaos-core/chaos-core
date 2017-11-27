const Discord = require('discord.js');

const Factory = require('../support/factory');

Factory.define('Guild', (options) => {
  let data = Object.assign({
    id: Factory.sequence((i) => `guildId-${i}`),
  }, options);

  if (!data.client) { data.client = new Discord.Client(); }

  let guild = new Discord.Guild(data.client, data);

  //stub out networked methods


  return guild;
});
