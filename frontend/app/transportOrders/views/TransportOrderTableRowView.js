// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/i18n',
  'app/core/View',
  'app/core/views/ListView',
  '../util/preparePrice',
  'app/transportOrders/templates/tableRow',
  'app/transportOrders/templates/user'
], function(
  _,
  time,
  user,
  t,
  View,
  ListView,
  preparePrice,
  template,
  renderUser
) {
  'use strict';

  return View.extend({

    keep: false,

    template: template,

    events: {

    },

    initialize: function()
    {
      this.listenTo(this.model, 'change', this.render);
    },

    serializeActions: function()
    {
      var model = this.model;
      var actions = [];

      if (model.isNotSeen())
      {
        actions.push({
          id: 'markAsSeen',
          icon: 'eye',
          label: t('transportOrders', 'LIST:ACTION:markAsSeen'),
          href: '#'
        });
      }

      actions.push(ListView.actions.viewDetails(model));

      if (model.isEditable())
      {
        actions.push({
          id: 'confirm',
          icon: 'check',
          label: t('transportOrders', 'LIST:ACTION:confirm'),
          href: model.genClientUrl('edit') + '?confirm=1'
        });
        actions.push(ListView.actions.edit(model));
      }

      if (model.isDeletable())
      {
        actions.push(ListView.actions.delete(model));
      }

      return actions;
    },

    serialize: function()
    {
      var model = this.model;
      var row = model.toJSON();

      row.idPrefix = this.idPrefix;
      row.changed = model.getChangedProperties();
      row.className = model.getStatusClassName();
      row.actions = this.serializeActions();

      if (row.tel)
      {
        row.owner.tel = row.tel;
      }

      row.owner = renderUser({user: row.owner});

      if (!row.driver)
      {
        row.driver = {_id: ''};
      }

      row.driver = renderUser({user: row.driver});

      if (!row.dispatcher)
      {
        row.dispatcher = {_id: ''};
      }

      row.dispatcher = renderUser({user: row.dispatcher});

      var userMoment = time.getMoment(row.userDate);

      row.userDate = userMoment.format('YYYY-MM-DD');
      row.userTime = userMoment.format('HH:mm');

      if (row.driverDate)
      {
        var driverMoment = time.getMoment(row.driverDate);

        row.driverDate = driverMoment.format('YYYY-MM-DD');
        row.driverTime = driverMoment.format('HH:mm');
      }
      else
      {
        row.driverDate = '-';
        row.driverTime = '-';
      }

      if (!row.toAddress)
      {
        row.toAddress = '-';
      }

      row.quantity = row.quantity.toLocaleString();
      row.unit = t.has('transportOrders', 'unit:' + row.unit) ? t('transportOrders', 'unit:' + row.unit) : row.unit;

      row.km = row.km.toLocaleString();
      row.hours = row.hours.toLocaleString();
      row.price = preparePrice(row.price).str;

      return {
        row: row
      };
    }

  });
});
