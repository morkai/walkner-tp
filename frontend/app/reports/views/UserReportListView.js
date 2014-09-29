// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/transportOrders/util/preparePrice',
  'app/reports/templates/userReportList'
], function(
  t,
  time,
  View,
  preparePrice,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    beforeRender: function()
    {
      this.stopListening(this.model, 'sync', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'sync', this.render);
    },

    serialize: function()
    {
      var summary = this.model.get('summary');

      return {
        idPrefix: this.idPrefix,
        collection: this.model.get('collection').map(this.serializeItem, this),
        summary: {
          km: summary.km.toLocaleString(),
          hours: summary.hours.toLocaleString(),
          price: preparePrice(summary.price).str
        }
      };
    },

    serializeItem: function(item)
    {
      item.kind = t('transportOrders', 'kind:' + item.kind);

      item.userTime = time.format(item.userDate, 'HH:mm');
      item.userDate = time.format(item.userDate, 'YYYY-MM-DD');

      if (item.driverDate)
      {
        item.driverTime = time.format(item.driverDate, 'HH:mm');
        item.driverDate = time.format(item.driverDate, 'YYYY-MM-DD');
      }
      else
      {
        item.driverTime = '-';
        item.driverDate = '-';
      }

      if (item.driver)
      {
        item.driver = item.driver.firstName || item.driver.lastName
          ? (item.driver.firstName + ' ' + item.driver.lastName)
          : (item.driver.label || item.driver.login || item.driver._id);
      }
      else
      {
        item.driver = '-';
      }

      item.quantity = item.quantity.toLocaleString();
      item.unit = t.has('transportOrders', 'unit:' + item.unit) ? t('transportOrders', 'unit:' + item.unit) : item.unit;
      item.symbol = item.symbol || '-';
      item.fromAddress = item.fromAddress.substr(0, 30);
      item.toAddress = item.toAddress.substr(0, 30) || '';
      item.km = item.km.toLocaleString();
      item.hours = item.hours.toLocaleString();
      item.price = preparePrice(item.price).str;

      return item;
    },

    refreshCollectionNow: function()
    {
      this.promised(this.model.fetch());
    }

  });
});
