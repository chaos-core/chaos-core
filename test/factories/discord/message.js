const Discord = require('discord.js');

const Factory = require('../../support/factory');

Factory.define('Message', (options) => {
  let data = Object.assign({
    content: '',
    embeds: [],
    attachments: [],
    channelType: null,
  }, options);

  if (!data.client) { data.client = new Discord.Client(); }
  if (!data.author) { data.author = Factory.create('User', {client: data.client}); }
  if (!data.channel) {
    switch (data.channelType) {
      case 'text':
      default:
        data.channel = Factory.create('TextChannel', {client: data.client});
        data.member = Factory.create('GuildMember', {client: data.client, user: data.author});
        data.channel.guild.members.create(data.member);
    }
  }

  let message = new Discord.Message(data.client, data, data.channel);

  //stub out networked methods


  return message;
});
