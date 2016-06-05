// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var setUpRoutes = require('./routes');
var setUpCommands = require('./commands');
var setUpEvents = require('./events');
var setUpPricing = require('./pricing');

exports.DEFAULT_CONFIG = {
  mongooseId: 'mongoose',
  expressId: 'express',
  userId: 'user',
  sioId: 'sio',
  currencyRatesId: 'currencyRates/nbp',
  settingsId: 'settings'
};

exports.start = function startTransportOrdersModule(app, transportOrdersModule)
{
  transportOrdersModule.hasAccessTo = function hasAccessTo(user, transportOrder)
  {
    if (!user)
    {
      return false;
    }

    var userModule = app[transportOrdersModule.config.userId];
    var canViewAll = userModule.isAllowedTo(user, [['TRANSPORT_ORDERS:DISPATCHER'], ['TRANSPORT_ORDERS:ALL']]);

    return canViewAll || _.includes(_.map(transportOrder.users, String), user._id.toString());
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

  app.onModuleReady(
    [
      transportOrdersModule.config.mongooseId,
      transportOrdersModule.config.sioId,
      transportOrdersModule.config.currencyRatesId,
      transportOrdersModule.config.settingsId
    ],
    setUpPricing.bind(null, app, transportOrdersModule)
  );
};
