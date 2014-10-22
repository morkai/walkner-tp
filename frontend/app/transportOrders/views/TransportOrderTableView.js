// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/time',
  'app/user',
  'app/i18n',
  'app/viewport',
  'app/core/views/ListView',
  './TransportOrderTableRowView',
  './TransportOrderCancelFormView',
  'app/transportOrders/templates/table'
], function(
  _,
  time,
  user,
  t,
  viewport,
  ListView,
  TransportOrderTableRowView,
  TransportOrderCancelFormView,
  template
) {
  'use strict';

  return ListView.extend({

    template: template,

    remoteTopics: {},

    events: _.extend({}, ListView.prototype.events, {

      'click .action-markAsSeen': function(e)
      {
        var $action = this.$(e.currentTarget).addClass('disabled');
        var $row = $action.closest('tr');
        var $next = $row.next();

        $row.removeClass('is-changed').find('.is-changed').removeClass('is-changed');

        if ($next.hasClass('tp-list-table-details'))
        {
          $next.find('.is-changed').removeClass('is-changed');
        }

        this.socket.emit('transportOrders.markAsSeen', $row.attr('data-id'), function(err)
        {
          if (err)
          {
            console.error(err);
          }
        });

        return false;
      },
      'click .action-cancel': function(e)
      {
        e.preventDefault();

        var cancelDialogView = new TransportOrderCancelFormView({
          model: this.getModelFromEvent(e),
          done: function () { viewport.closeDialog(); }
        });

        viewport.showDialog(cancelDialogView, t.bound('transportOrders', 'cancel:title'));
      },
      'click .actions .btn': function(e)
      {
        e.stopPropagation();
      },
      'click .list-item': function(e)
      {
        this.getView({el: e.currentTarget}).toggleDetails();

        return false;
      }

    }),

    initialize: function()
    {
      ListView.prototype.initialize.call(this);

      this.listenTo(this.collection, 'add', this.onCollectionAdd);
      this.listenTo(this.collection, 'remove', this.onCollectionRemove);
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix,
        noData: !this.collection.length
      };
    },

    beforeRender: function()
    {
      ListView.prototype.beforeRender.call(this);

      this.collection.forEach(function(transportOrder)
      {
        this.insertView('tbody', new TransportOrderTableRowView({model: transportOrder}));
      }, this);
    },

    afterRender: function()
    {
      ListView.prototype.afterRender.call(this);
    },

    onCollectionAdd: function(transportOrder)
    {
      var rowView = new TransportOrderTableRowView({model: transportOrder});
      var options = {insertAt: this.collection.indexOf(transportOrder)};

      this.insertView('tbody', rowView, options).render();
    },

    onCollectionRemove: function(transportOrder)
    {
      this.getView({model: transportOrder}).remove();
    }

  });
});
