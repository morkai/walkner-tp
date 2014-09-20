// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpEvents = require('./events');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio'
};

exports.start = function startOrdersModule(app, ordersModule)
{
  app.onModuleReady(
    [
      ordersModule.config.mongooseId,
      ordersModule.config.userId,
      ordersModule.config.expressId
    ],
    setUpRoutes.bind(null, app, ordersModule)
  );

  app.onModuleReady(
    [
      ordersModule.config.sioId
    ],
    setUpCommands.bind(null, app, ordersModule)
  );

  app.onModuleReady(
    [
      ordersModule.config.mongooseId
    ],
    setUpEvents.bind(null, app, ordersModule)
  );
};
