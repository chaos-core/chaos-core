const Discord = require('discord.js');

const Factory = require('../../support/factory');

Factory.define('GuildMember', (options) => {
  let data = Object.assign({

  }, options);

  if (!data.client) { data.client = new Discord.Client();    }
  if (!data.user)   { data.user   = Factory.create('User',  { client: data.client } ); }
  if (!data.guild)  { data.guild  = Factory.create('Guild', { client: data.client } ); }

  let guildMember = new Discord.GuildMember(data.client, data, data.guild);

  //stub out networked methods
  guildMember.addRole = Factory.sinon.stub().callsFake((role) => { guildMember._roles.push(role.id); });

  return guildMember;
});
