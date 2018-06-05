// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = function driverReportRoute(app, transportOrdersModule, req, res, next)
{
  var mongoose = app[transportOrdersModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');

  var result = {
    collection: [],
    orders: 0,
    km: 0,
    hours: 0,
    price: 0.00
  };

  var conditions = mongoSerializer.fromQuery(req.rql).selector;

  if (!conditions.userDate)
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
    kind: 1,
    km: 1,
    hours: 1,
    price: 1
  };
  var stream = TransportOrder
    .find(conditions, fields)
    .sort({userDate: 1})
    .lean()
    .cursor();

  var kindSummaries = {};

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

    _.forEach(kindSummaries, function(kindSummary)
    {
      kindSummary.price = Math.round(kindSummary.price * 100) / 100;

      result.collection.push(kindSummary);
    });

    result.price = Math.round(result.price * 100) / 100;

    res.json(result);
  });

  stream.on('data', function(transportOrder)
  {
    if (!self && transportOrder.symbol === null)
    {
      return;
    }

    if (transportOrder.driver === null)
    {
      transportOrder.driver = {_id: '', label: '?'};
    }

    var kind = transportOrder.kind;

    if (kindSummaries[kind] === undefined)
    {
      kindSummaries[kind] = {
        kind: kind,
        orders: 0,
        km: 0,
        hours: 0,
        price: 0.00
      };
    }

    var kindSummary = kindSummaries[kind];

    kindSummary.orders += 1;
    kindSummary.km += transportOrder.km;
    kindSummary.hours += transportOrder.hours;
    kindSummary.price += transportOrder.price;

    result.orders += 1;
    result.km += transportOrder.km;
    result.hours += transportOrder.hours;
    result.price += transportOrder.price;
  });
};
