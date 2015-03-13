// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = function symbolReportRoute(app, transportOrdersModule, req, res, next)
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

  var symbols = conditions.symbol ? (conditions.symbol.$in || conditions.symbol) : [];
  var self = !!conditions.self;

  delete conditions.self;

  var fields = {
    _id: 0,
    owner: 1,
    symbol: 1,
    km: 1,
    hours: 1,
    price: 1
  };
  var stream = TransportOrder
    .find(conditions, fields)
    .sort({userDate: 1})
    .populate('owner', TransportOrder.USER_FIELDS)
    .lean()
    .stream();

  var symbolSummaries = {};

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

    lodash.forEach(symbolSummaries, function(symbolSummary)
    {
      symbolSummary.orders = round(symbolSummary.orders);
      symbolSummary.km = round(symbolSummary.km);
      symbolSummary.hours = round(symbolSummary.hours);
      symbolSummary.price = round(symbolSummary.price);
      symbolSummary.owners = lodash.map(symbolSummary.owners, function(ownerSummary)
      {
        ownerSummary.orders = round(ownerSummary.orders);
        ownerSummary.km = round(ownerSummary.km);
        ownerSummary.hours = round(ownerSummary.hours);
        ownerSummary.price = round(ownerSummary.price);

        return ownerSummary;
      });

      result.collection.push(symbolSummary);
    });

    result.price = round(result.price);

    res.json(result);
  });

  stream.on('data', function(transportOrder)
  {
    if (!self && transportOrder.symbol === null)
    {
      return;
    }

    var splitTransportOrders = splitOrder(transportOrder);

    lodash.forEach(splitTransportOrders, function(splitTransportOrder)
    {
      if (symbols.length && symbols.indexOf(splitTransportOrder.symbol) === -1)
      {
        return;
      }

      ensureData(splitTransportOrder);

      var symbolSummary = symbolSummaries[splitTransportOrder.symbol];

      symbolSummary.orders += 1 / splitTransportOrders.length;
      symbolSummary.km += splitTransportOrder.km;
      symbolSummary.hours += splitTransportOrder.hours;
      symbolSummary.price += splitTransportOrder.price;

      var ownerSummary = symbolSummary.owners[splitTransportOrder.owner._id];

      ownerSummary.orders += 1 / splitTransportOrders.length;
      ownerSummary.km += splitTransportOrder.km;
      ownerSummary.hours += splitTransportOrder.hours;
      ownerSummary.price += splitTransportOrder.price;
    });

    result.orders += 1;
    result.km += transportOrder.km;
    result.hours += transportOrder.hours;
    result.price += transportOrder.price;
  });

  function round(num)
  {
    return Math.round(num * 100) / 100;
  }

  function splitOrder(transportOrder)
  {
    if (!Array.isArray(transportOrder.symbol))
    {
      transportOrder.symbol = [String(transportOrder.symbol)];
    }

    var splitTransportOrders = {};
    var symbolCount = transportOrder.symbol.length;

    lodash.forEach(transportOrder.symbol, function(symbol)
    {
      if (!splitTransportOrders[symbol])
      {
        splitTransportOrders[symbol] = {
          owner: transportOrder.owner,
          symbol: symbol,
          km: 0,
          hours: 0,
          price: 0
        };
      }

      var splitTransportOrder = splitTransportOrders[symbol];

      splitTransportOrder.km += transportOrder.km / symbolCount;
      splitTransportOrder.hours += transportOrder.hours / symbolCount;
      splitTransportOrder.price += transportOrder.price / symbolCount;
    });

    return lodash.values(splitTransportOrders);
  }

  function ensureData(transportOrder)
  {
    if (transportOrder.owner === null)
    {
      transportOrder.owner = {_id: '', label: '?'};
    }

    var symbol = transportOrder.symbol;

    if (symbolSummaries[symbol] === undefined)
    {
      symbolSummaries[symbol] = {
        symbol: symbol,
        owners: {},
        orders: 0,
        km: 0,
        hours: 0,
        price: 0.00
      };
    }

    var owner = transportOrder.owner;

    if (symbolSummaries[symbol].owners[owner._id] === undefined)
    {
      symbolSummaries[symbol].owners[owner._id] = {
        owner: owner.label || (owner.firstName + ' ' + owner.lastName).trim() || owner._id,
        orders: 0,
        km: 0,
        hours: 0,
        price: 0.00
      };
    }
  }
};
