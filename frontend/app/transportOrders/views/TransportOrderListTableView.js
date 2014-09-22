// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/i18n',
  'app/core/views/ListView',
  '../util/preparePrice',
  'app/transportOrders/templates/listTable',
  'app/transportOrders/templates/user'
], function(
  _,
  time,
  user,
  t,
  ListView,
  preparePrice,
  template,
  renderUser
) {
  'use strict';

  return ListView.extend({

    template: template,

    remoteTopics: {},

    localTopics: {
      'transportOrders.added.*': 'refreshCollection',
      'transportOrders.edited.*': 'refreshCollection',
      'transportOrders.deleted.*': 'onModelDeleted'
    },

    events: _.extend({}, ListView.prototype.events, {

      'click .action-markAsSeen': function(e)
      {
        var $action = this.$(e.currentTarget).addClass('disabled');
        var $row = $action.closest('tr');
        var transportOrder = this.collection.get($row.attr('data-id'));

        $row.removeClass('is-changed').find('.is-changed').removeClass('is-changed');

        this.socket.emit('transportOrders.markAsSeen', transportOrder.id);

        return false;
      }

    }),

    initialize: function()
    {
      ListView.prototype.initialize.call(this);
    },

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [];

        if (model.isNotSeen())
        {
          actions.push({
            id: 'markAsSeen',
            icon: 'eye',
            label: t.bound('transportOrders', 'LIST:ACTION:markAsSeen'),
            href: '#'
          });
        }

        actions.push(ListView.actions.viewDetails(model));

        if (model.isEditable())
        {
          actions.push({
            id: 'confirm',
            icon: 'check',
            label: t.bound('transportOrders', 'LIST:ACTION:confirm'),
            href: model.genClientUrl('edit') + '?confirm=1'
          });
          actions.push(ListView.actions.edit(model));
        }

        if (model.isDeletable())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    },

    serializeRow: function(model)
    {
      var row = model.toJSON();

      row.className = model.getStatusClassName();
      row.changed = model.getChangedProperties();

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

      return row;
    }

  });
});
