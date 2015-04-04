// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/time',
  'app/data/airports',
  'app/core/views/DetailsView',
  'app/transportOrders/templates/details',
  '../util/preparePrice',
  '../util/serializeSymbol'
], function(
  t,
  time,
  airports,
  DetailsView,
  detailsTemplate,
  preparePrice,
  serializeSymbol
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    serialize: function()
    {
      var model = this.model;
      var creator = model.get('creator') || {};
      var owner = model.get('owner') || {};
      var driver = model.get('driver');
      var dispatcher = model.get('dispatcher');
      var unit = model.get('unit');
      var driverDate = model.get('driverDate');
      var costs = model.get('costs');
      var resolvedPanelType = !model.isResolved()
        ? null
        : model.get('status') === 'completed' ? 'success' : 'danger';

      return {
        idPrefix: this.idPrefix,
        changed: model.get('changedProperties'),
        rid: model.get('rid'),
        kind: model.get('kind'),
        user: {
          panelType: resolvedPanelType || (model.get('ownerConfirmed') ? 'info' : 'warning'),
          creator: {
            name: this.serializeUserName(creator),
            tel: creator.tel || '-'
          },
          createdAt: time.format(model.get('createdAt'), 'LLLL'),
          name: this.serializeUserName(owner),
          tel: model.get('tel') || owner.tel || '-',
          date: time.format(model.get('userDate'), 'LLLL'),
          symbol: serializeSymbol(model.get('symbol'), '-', true),
          zpl: model.get('zpl') || '-',
          quantity: this.serializeQuantity(),
          unit: t.has('transportOrders', 'unit:' + unit) ? t('transportOrders', 'unit:' + unit) : unit,
          cargo: model.get('cargo') || '-',
          airport: airports.getLabel(model.get('airport')) || '-',
          flightNo: model.get('flightNo'),
          fromAddress: model.get('fromAddress'),
          toAddress: model.get('toAddress') || '-',
          costs: typeof costs === 'string' && costs.length > 0 ? costs : null
        },
        driver: {
          panelType: resolvedPanelType || (model.get('driverConfirmed') ? 'info' : 'warning'),
          name: this.serializeUserName(driver),
          tel: driver && driver.tel ? driver.tel : '-',
          date: driverDate ? time.format(driverDate, 'LLLL') : '-',
          km: model.get('km').toLocaleString(),
          hours: model.get('hours').toLocaleString()
        },
        dispatcher: {
          panelType: resolvedPanelType || (model.get('dispatcherConfirmed') ? 'info' : 'warning'),
          name: this.serializeUserName(dispatcher),
          tel: dispatcher && dispatcher.tel ? dispatcher.tel : '-',
          status: t('transportOrders', 'status:' + model.get('status')),
          price: preparePrice(model.get('price')).str,
          cash: t('core', 'BOOL:' + !!model.get('cash'))
        }
      };
    },

    serializeQuantity: function()
    {
      var kind = this.model.get('kind');

      if (kind === 'vehicleService' || kind === 'carWash')
      {
        return null;
      }

      var unit = this.model.get('unit');
      var quantity = this.model.get('quantity').toLocaleString();

      if (!t.has('transportOrders', 'unit:' + unit))
      {
        quantity += ' ' + unit;
      }

      return quantity;
    },

    serializeUserName: function(user)
    {
      if (!user)
      {
        return '-';
      }

      if (user.label)
      {
        return user.label;
      }

      if (user.firstName || user.lastName)
      {
        return user.firstName + ' ' + user.lastName;
      }

      return user.login || user._id || '-';
    }

  });
});
