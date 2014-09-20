// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');

module.exports = function setUpOrdersCommands(app, ordersModule)
{
  var sio = app[ordersModule.config.sioId];
  var userModule = app[ordersModule.config.userId];
  var mongoose = app[ordersModule.config.mongooseId];

  sio.sockets.on('connection', function(socket)
  {

  });
};
