// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = function userReportRoute(app, transportOrdersModule, req, res, next)
{
  var mongoose = app[transportOrdersModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');

  var result = {
    collection: [],
    km: 0,
    hours: 0,
    price: 0.00
  };

  var conditions = mongoSerializer.fromQuery(req.rql).selector;

  if (!conditions.userDate || !conditions.owner)
  {
    return res.json(result);
  }

  if (conditions.cash)
  {
    delete conditions.cash;
  }
  else
  {
    conditions.cash = false;
  }

  var self = !!conditions.self;

  delete conditions.self;

  var fields = {
    _id: 0,
    rid: 1,
    status: 1,
    kind: 1,
    owner: 1,
    tel: 1,
    userDate: 1,
    quantity: 1,
    unit: 1,
    fromAddress: 1,
    toAddress: 1,
    symbol: 1,
    driver: 1,
    km: 1,
    hours: 1,
    price: 1
  };
  var stream = TransportOrder
    .find(conditions, fields)
    .sort({userDate: 1})
    .populate('owner', TransportOrder.USER_FIELDS)
    .populate('driver', TransportOrder.USER_FIELDS)
    .lean()
    .cursor();

  stream.on('error', function(err)
  {
    if (!res.headersSent)
    {
      next(err);
    }
  });

  stream.on('end', function()
  {
    if (res.headersSent)
    {
      return;
    }

    result.price = Math.round(result.price * 100) / 100;

    res.json(result);
  });

  stream.on('data', function(transportOrder)
  {
    if (!self && transportOrder.symbol === null)
    {
      return;
    }

    result.collection.push(transportOrder);
    result.km += transportOrder.km;
    result.hours += transportOrder.hours;
    result.price += transportOrder.price;
  });
};
