// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
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
    symbol: 1,
    driver: 1,
    km: 1,
    hours: 1,
    price: 1
  };
  var stream = TransportOrder
    .find(conditions, fields)
    .sort({userDate: 1})
    .populate('driver', TransportOrder.USER_FIELDS)
    .lean()
    .stream();

  var driverSummaries = {};

  stream.on('error', function(err)
  {
    if (!res.headersSent)
    {
      next(err);
    }
  });

  stream.on('close', function()
  {
    if (res.headersSent)
    {
      return;
    }

    lodash.forEach(driverSummaries, function(driverSummary)
    {
      driverSummary.price = Math.round(driverSummary.price * 100) / 100;

      result.collection.push(driverSummary);
    });

    result.price = Math.round(result.price * 100) / 100;

    res.json(result);
  });

  stream.on('data', function(transportOrder)
  {
    if (transportOrder.symbol === '_SELF' && !self)
    {
      return;
    }

    if (transportOrder.driver === null)
    {
      transportOrder.driver = {_id: '', label: '?'};
    }

    var driver = transportOrder.driver;

    if (driverSummaries[driver._id] === undefined)
    {
      driverSummaries[driver._id] = {
        driver: driver.label || (driver.firstName + ' ' + driver.lastName).trim() || driver.login || driver._id,
        orders: 0,
        km: 0,
        hours: 0,
        price: 0.00
      };
    }

    var driverSummary = driverSummaries[driver._id];

    driverSummary.orders += 1;
    driverSummary.km += transportOrder.km;
    driverSummary.hours += transportOrder.hours;
    driverSummary.price += transportOrder.price;

    result.orders += 1;
    result.km += transportOrder.km;
    result.hours += transportOrder.hours;
    result.price += transportOrder.price;
  });
};
