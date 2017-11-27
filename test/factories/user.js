const Discord = require('discord.js');

const Factory = require('../support/factory');

Factory.define('User', (options) => {
  let userData = Object.assign({
    id: Factory.sequence((i) => `userId-${i}`),
  }, options);

  let user = new Discord.User({}, userData);

  // Stub out networked methods
  user.addFriend = Factory.sinon.stub().resolves(user);
  user.block = Factory.sinon.stub().resolves(user);
  user.createDM = Factory.sinon.stub().resolves({});
  user.deleteDM = Factory.sinon.stub().resolves({});
  user.fetchProfile = Factory.sinon.stub().resolves({});
  user.removeFriend = Factory.sinon.stub().resolves(user);
  user.send = Factory.sinon.stub().callsFake((msg) => new Promise((resolve) => resolve(msg)));
  user.setNote = Factory.sinon.stub().resolves(user);
  user.unblock = Factory.sinon.stub().resolves(user);

  return user;
});
