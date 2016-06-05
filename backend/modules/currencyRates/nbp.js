// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var _ = require('lodash');
var xml2js = require('xml2js');
var request = require('request');
var moment = require('moment');
var defaultRates = require('./nbp.json');

exports.DEFAULT_CONFIG = {
  refreshTime: [12, 25]
};

exports.start = function startCurrencyRatesNbpModule(app, module)
{
  var LATEST_RATES_URL = 'http://www.nbp.pl/kursy/xml/LastA.xml';

  module.ratesDate = new Date(defaultRates.date);

  module.rates = defaultRates.rates;

  module.convert = function(input, currencyCode)
  {
    if (currencyCode === 'PLN')
    {
      return input;
    }

    var currencyRate = module.rates[currencyCode];

    if (!currencyRate)
    {
      return 0;
    }

    return Math.round(input * currencyRate.multiplier / currencyRate.rate * 100) / 100;
  };

  app.broker.subscribe('app.started', updateRates).setLimit(1);

  function updateRates()
  {
    request.get(LATEST_RATES_URL, function(err, res, body)
    {
      if (err)
      {
        module.error("Failed to fetch current rates: %s", err.message);

        return scheduleUpdateRates();
      }

      if (res.statusCode !== 200)
      {
        module.error("Failed to fetch current rates: expected status code 200, got %d", res.statusCode);

        return scheduleUpdateRates();
      }

      xml2js.parseString(body, parseXml);
    });
  }

  function parseXml(err, xml)
  {
    if (err)
    {
      module.error("Failed to parse XML: %s", err.message);

      return scheduleUpdateRates();
    }

    if (!_.isObject(xml) || !_.isObject(xml.tabela_kursow))
    {
      module.error("Failed to parse XML: invalid structure.");

      return scheduleUpdateRates();
    }

    var table = xml.tabela_kursow;

    if (!Array.isArray(table.data_publikacji) || !Array.isArray(table.pozycja))
    {
      module.error("Failed to parse XML: invalid rates date or items.");

      return scheduleUpdateRates();
    }

    var ratesDate = new Date(table.data_publikacji[0] + ' 00:00:00');

    if (isNaN(ratesDate.getTime()))
    {
      module.error("Failed to parse XML: invalid rates date.");

      return scheduleUpdateRates();
    }

    module.rates = {};

    _.forEach(table.pozycja, function(item)
    {
      if (!Array.isArray(item.nazwa_waluty) || !item.nazwa_waluty.length
        || !Array.isArray(item.przelicznik) || !item.przelicznik.length
        || !Array.isArray(item.kod_waluty) || !item.kod_waluty.length
        || !Array.isArray(item.kurs_sredni) || !item.kurs_sredni.length)
      {
        return;
      }

      var currencyRate = {
        name: item.nazwa_waluty[0],
        multiplier: parseInt(item.przelicznik[0], 10),
        code: item.kod_waluty[0],
        rate: parseFloat(item.kurs_sredni[0].replace(',', '.'))
      };

      module.rates[currencyRate.code] = currencyRate;
    });

    module.ratesDate = ratesDate;

    module.info("Currency rates updated to: %s", ratesDate);

    app.broker.publish('currencyRates.nbp.updated', {
      date: ratesDate,
      rates: module.rates
    });

    scheduleUpdateRates(true);
  }

  function scheduleUpdateRates(success)
  {
    var delay = 10 * 60 * 1000;

    if (success)
    {
      delay = moment()
        .add(1, 'days')
        .hours(module.config.refreshTime[0])
        .minutes(module.config.refreshTime[1])
        .seconds(0)
        .milliseconds(0)
        .diff(Date.now());
    }

    setTimeout(updateRates, delay);
  }
};
