// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/time',
  'app/core/View',
  'app/transportOrders/util/preparePrice',
  'app/reports/templates/kindReportList'
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
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        collection: model.get('collection').map(this.serializeItem, this),
        summary: {
          orders: model.get('orders').toLocaleString(),
          km: model.get('km').toLocaleString(),
          hours: model.get('hours').toLocaleString(),
          price: preparePrice(model.get('price')).str
        }
      };
    },

    serializeItem: function(item)
    {
      item.orders = item.orders.toLocaleString();
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
