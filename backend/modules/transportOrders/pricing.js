// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var moment = require('moment');
var step = require('h5.step');

module.exports = function setUpTransportOrdersPricing(app, tpModule)
{
  var sio = app[tpModule.config.sioId];
  var currencyRates = app[tpModule.config.currencyRatesId];
  var settings = app[tpModule.config.settingsId];
  var mongoose = app[tpModule.config.mongooseId];
  var TransportOrder = mongoose.model('TransportOrder');

  sio.sockets.on('connection', function(socket)
  {
    socket.on('transportOrders.calcPrices', function(input, reply)
    {
      if (!lodash.isFunction(reply))
      {
        return;
      }

      if (!lodash.isObject(input) || !lodash.isNumber(input.km) || !lodash.isNumber(input.hours))
      {
        return reply(new Error('INPUT'));
      }

      if (!Array.isArray(input.currencies) || !input.currencies.length)
      {
        input.currencies = ['PLN', 'EUR'];
      }

      if (!lodash.isString(input.kind))
      {
        input.kind = null;
      }

      calcPrices(input, reply);
    });
  });

  function calcPrices(input, done)
  {
    step(
      function findSettingsStep()
      {
        var conditions = {
          _id: {
            $in: [
              'tp.pricing.avgDaysAgo',
              'tp.pricing.avgMinOrders',
              'tp.pricing.avgPerKind',
              'tp.pricing.perKm',
              'tp.pricing.perHour'
            ]
          }
        };

        settings.findValues(conditions, 'tp.pricing.', this.next());
      },
      function prepareSettingsStep(err, settings)
      {
        if (err)
        {
          return this.done(done, err);
        }

        if (!lodash.isNumber(settings.avgDaysAgo))
        {
          settings.avgDaysAgo = 0;
        }

        if (!lodash.isNumber(settings.avgMinOrders))
        {
          settings.avgMinOrders = 10;
        }

        if (settings.avgPerKind !== 1)
        {
          settings.avgPerKind = 0;
        }

        if (!lodash.isNumber(settings.perKm))
        {
          settings.perKm = 1.5;
        }

        if (!lodash.isNumber(settings.perHour))
        {
          settings.perHour = 30;
        }

        this.settings = settings;
      },
      function calcAvgPricesStep()
      {
        if (this.settings.avgDaysAgo <= 0)
        {
          return;
        }

        var conditions = {
          status: 'completed',
          userDate: {$gt: moment().subtract(this.settings.avgDaysAgo, 'days').toDate()},
          price: {$ne: 0},
          hours: 0
        };

        if (this.settings.avgPerKind && input.kind)
        {
          conditions.kind = input.kind;
        }

        TransportOrder.aggregate(
          {$match: conditions},
          {$group: {
            _id: null,
            orderCount: {$sum: 1},
            totalKm: {$sum: '$km'},
            totalPrice: {$sum: '$price'}
          }},
          this.next()
        );
      },
      function calcPricesStep(err, results)
      {
        if (err)
        {
          return this.done(done, err);
        }

        var pricePerKm = this.settings.perKm;
        var pricePerHour = this.settings.perHour;

        if (Array.isArray(results) && results.length && results[0].orderCount >= this.settings.avgMinOrders)
        {
          pricePerKm = results[0].totalPrice / results[0].totalKm;
        }

        var prices = [];
        var kmPrice = pricePerKm * input.km;
        var hoursPrice = pricePerHour * input.hours;

        lodash.forEach(input.currencies, function(currencyCode)
        {
          var price = {
            currency: currencyCode,
            km: Math.max(currencyRates.convert(kmPrice, currencyCode), 0),
            hours: Math.max(currencyRates.convert(hoursPrice, currencyCode), 0),
            total: 0
          };

          price.total = roundPrice(price.km + price.hours);

          prices.push(price);
        });

        done(null, {
          settings: this.settings,
          ratesDate: currencyRates.ratesDate,
          prices: prices
        });
      }
    );
  }

  function roundPrice(price)
  {
    return Math.round(price * 100) / 100;
  }
};
