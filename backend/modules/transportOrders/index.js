// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpEvents = require('./events');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio'
};

exports.start = function startTransportOrdersModule(app, transportOrdersModule)
{
  transportOrdersModule.hasAccessTo = function hasAccessTo(user, transportOrder)
  {
    return app[transportOrdersModule.config.userId].isAllowedTo(user, 'TRANSPORT_ORDERS:DISPATCHER')
      || lodash.contains(lodash.map(transportOrder.users, String), user._id);
  };

  app.onModuleReady(
    [
      transportOrdersModule.config.mongooseId,
      transportOrdersModule.config.userId,
      transportOrdersModule.config.expressId
    ],
    setUpRoutes.bind(null, app, transportOrdersModule)
  );

  app.onModuleReady(
    [
      transportOrdersModule.config.sioId
    ],
    setUpCommands.bind(null, app, transportOrdersModule)
  );

  app.onModuleReady(
    [
      transportOrdersModule.config.mongooseId
    ],
    setUpEvents.bind(null, app, transportOrdersModule)
  );
};
