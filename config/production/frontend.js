'use strict';

var config = module.exports = require('../frontend');

var blacklisted = [
  
];

config.modules = config.modules.filter(function(module)
{
  return blacklisted.indexOf(module.name || module) === -1;
});

config.user.root = {
  // test
  password: '$2a$10$M5R2udDWReAL4UxBW3IeV.eqssUxm7syXOaovmdscUmLzitxDPx7G'
};

config.httpServer.port = 80;

config['mail/sender'].smtp = {
  service: 'Gmail',
  auth: {
    user: 'test123456@gmail.com',
    pass: 'test'
  }
};
config['mail/sender'].from = 'Travelka <test123456@gmail.com>';
config['mail/sender'].replyTo = 'Travelka <test123456@gmail.com>';
