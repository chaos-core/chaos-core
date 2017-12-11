const Discord = require('discord.js');

const Factory = require('../../support/factory');

Factory.define('TextChannel', (options) => {
  let data = Object.assign({
    guild: Factory.create('Guild'),
  }, options);

  data.type = 0; // Discord uses an internal integer for channel types
  let channel = new Discord.TextChannel(data.guild, data);

  //stub out networked methods
  channel.send = Factory.sinon.stub().callsFake((msg) => new Promise((resolve) => resolve(msg)));

  return channel;
});
