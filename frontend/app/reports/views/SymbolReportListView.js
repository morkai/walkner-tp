// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../../i18n',
  'app/time',
  'app/core/View',
  'app/transportOrders/util/preparePrice',
  'app/reports/templates/symbolReportList'
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
        collection: model.get('collection').map(this.serializeSymbol, this),
        summary: {
          km: model.get('km').toLocaleString(),
          hours: model.get('hours').toLocaleString(),
          price: preparePrice(model.get('price')).str
        }
      };
    },

    serializeSymbol: function(data)
    {
      if (data.symbol === '_SELF')
      {
        data.symbol = t('transportOrders', 'symbol:self');
      }
      else if (!data.symbol)
      {
        data.symbol = '?';
      }

      data.km = data.km.toLocaleString();
      data.hours = data.hours.toLocaleString();
      data.price = preparePrice(data.price).str;
      data.owners = data.owners.map(this.serializeOwner, this);

      return data;
    },

    serializeOwner: function(data)
    {
      data.owner = data.owner || '?';
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
