// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../../i18n',
  'app/time',
  'app/core/View',
  'app/transportOrders/util/preparePrice',
  'app/transportOrders/util/serializeSymbol',
  'app/reports/templates/symbolReportList'
], function(
  t,
  time,
  View,
  preparePrice,
  serializeSymbol,
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
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        collection: model.get('collection')
          .sort(function(a, b) { return a.symbol.localeCompare(b.symbol); })
          .map(this.serializeSymbol, this),
        summary: {
          orders: model.get('orders').toLocaleString(),
          km: model.get('km').toLocaleString(),
          hours: model.get('hours').toLocaleString(),
          price: preparePrice(model.get('price')).str
        }
      };
    },

    serializeSymbol: function(data)
    {
      data.symbol = serializeSymbol(data.symbol, '?', true);
      data.orders = data.orders.toLocaleString();
      data.km = data.km.toLocaleString();
      data.hours = data.hours.toLocaleString();
      data.price = preparePrice(data.price).str;
      data.owners = data.owners.map(this.serializeOwner, this);

      return data;
    },

    serializeOwner: function(data)
    {
      data.owner = data.owner || '?';
      data.orders = data.orders.toLocaleString();
      data.km = data.km.toLocaleString();
      data.hours = data.hours.toLocaleString();
      data.price = preparePrice(data.price).str;

      return data;
    },

    refreshCollectionNow: function()
    {
      this.promised(this.model.fetch());
    }

  });
});
