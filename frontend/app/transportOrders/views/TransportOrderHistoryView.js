// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/time',
  'app/user',
  'app/core/View',
  'app/transportOrders/templates/history',
  'app/transportOrders/templates/user',
  '../util/preparePrice'
], function(
  t,
  time,
  user,
  View,
  detailsTemplate,
  renderUser,
  preparePrice
) {
  'use strict';

  return View.extend({

    template: detailsTemplate,

    events: {
      'click #-toggleComments': function()
      {
        this.$el.toggleClass('is-comments-only');

        this.broker.publish('router.navigate', {
          url: this.model.genClientUrl() + '?changes=' + (this.$el.hasClass('is-comments-only') ? 0 : 1),
          trigger: false,
          replace: true
        });
      }
    },

    beforeRender: function()
    {
      this.stopListening(this.model, 'change:changes', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.model, 'change:changes', this.render);

      if (this.options.showChanges)
      {
        this.$id('toggleComments').click();
      }
    },

    serialize: function()
    {
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        isNew: model.get('changedProperties').all,
        creator: this.serializeUserName(model.get('creator')),
        createdAt: time.format(model.get('createdAt'), 'LLLL'),
        notes: model.get('notes'),
        entries: model.get('changes').map(this.serializeEntry.bind(this, model.getLastSeenAt()))
      };
    },

    serializeEntry: function(lastSeenAt, entry)
    {
      var kind = this.model.get('kind');
      var createdAtMoment = time.getMoment(entry.date);
      var createdAtTime = createdAtMoment.valueOf();

      entry.isNew = lastSeenAt === -1 || entry.user._id === user.data._id
        ? false
        : (lastSeenAt === 0 || createdAtTime >= lastSeenAt);
      entry.changes = [];

      Object.keys(entry.data || {}).forEach(function(property)
      {
        var propertyKey = t.has('transportOrders', property + ':' + kind)
          ? (property + ':' + kind)
          : ('PROPERTY:' + property);

        entry.changes.push({
          property: t('transportOrders', propertyKey),
          oldValue: this.serializeValue(property, entry.data[property][0]),
          newValue: this.serializeValue(property, entry.data[property][1])
        });
      }, this);

      entry.time = createdAtMoment.format('LLLL');
      entry.user = this.serializeUserName(entry.user);

      return entry;
    },

    serializeValue: function(property, value)
    {
      if (typeof value === 'boolean')
      {
        return t('core', 'BOOL:' + value);
      }

      if (property === 'price')
      {
        return preparePrice(value);
      }

      if (typeof value === 'number')
      {
        return value.toLocaleString();
      }

      if (!value)
      {
        return '-';
      }

      if (property === 'owner' || property === 'dispatcher' || property === 'driver')
      {
        return renderUser({user: value});
      }

      if (property === 'status')
      {
        return t('transportOrders', 'status:' + value);
      }

      if (property === 'userDate' || property === 'driverDate')
      {
        return time.format(value, 'LLLL');
      }

      if (property === 'cargo' || property === 'fromAddress' || property === 'toAddress' || property === 'notes')
      {
        return '<span class="text-mono">' + value + '</span>';
      }

      return value;
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

      return user.login || user._id;
    }

  });
});
