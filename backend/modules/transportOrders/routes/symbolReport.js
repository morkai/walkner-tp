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
      symbolSummary.price = Math.round(symbolSummary.price * 100) / 100;
      symbolSummary.owners = lodash.map(symbolSummary.owners, function(ownerSummary)
      {
        ownerSummary.price = Math.round(ownerSummary.price * 100) / 100;

        return ownerSummary;
      });

      result.collection.push(symbolSummary);
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

    ensureData(transportOrder);

    var symbolSummary = symbolSummaries[transportOrder.symbol];

    symbolSummary.km += transportOrder.km;
    symbolSummary.hours += transportOrder.hours;
    symbolSummary.price += transportOrder.price;

    var ownerSummary = symbolSummary.owners[transportOrder.owner._id];

    ownerSummary.km += transportOrder.km;
    ownerSummary.hours += transportOrder.hours;
    ownerSummary.price += transportOrder.price;

    result.km += transportOrder.km;
    result.hours += transportOrder.hours;
    result.price += transportOrder.price;
  });

  function ensureData(transportOrder)
  {
    if (transportOrder.owner === null)
    {
      transportOrder.owner = {_id: '', label: '?'};
    }

    transportOrder.symbol = typeof transportOrder.symbol === 'string' ? transportOrder.symbol.trim() : '';

    var symbol = transportOrder.symbol;

    if (symbolSummaries[symbol] === undefined)
    {
      symbolSummaries[symbol] = {
        symbol: symbol,
        owners: {},
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
        km: 0,
        hours: 0,
        price: 0.00
      };
    }
  }
};
