// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  'app/core/util/onModelDeleted',
  'app/transportOrders/templates/detailsPage',
  '../views/TransportOrderDetailsView',
  '../views/TransportOrderHistoryView'
], function(
  t,
  user,
  View,
  pageActions,
  bindLoadingMessage,
  onModelDeleted,
  template,
  TransportOrderDetailsView,
  TransportOrderHistoryView
) {
  'use strict';

  return View.extend({

    template: template,

    layoutName: 'page',

    localTopics: function()
    {
      var topics = {};

      topics['transportOrders.edited.' + this.model.id] = 'onModelEdited';
      topics['transportOrders.deleted.' + this.model.id] = 'onModelDeleted';

      return topics;
    },

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('transportOrders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var model = this.model;
      var actions = [];

      if (model.isNotSeen())
      {
        actions.push({
          id: 'markAsSeen',
          icon: 'eye',
          label: t('transportOrders', 'PAGE_ACTION:markAsSeen'),
          callback: this.markAsSeen.bind(this)
        });
      }

      if (model.isEditable())
      {
        actions.push({
          id: 'confirm',
          icon: 'check',
          label: t('transportOrders', 'PAGE_ACTION:confirm'),
          href: model.genClientUrl('edit') + '?confirm=1'
        });
        actions.push(pageActions.edit(model, null));
      }

      if (model.isDeletable())
      {
        actions.push(pageActions.delete(model, null));
      }

      return actions;
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.detailsView = new TransportOrderDetailsView({model: this.model});
      this.historyView = new TransportOrderHistoryView({model: this.model});

      this.setView('.tp-detailsPage-details', this.detailsView);
      this.setView('.tp-detailsPage-history', this.historyView);
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    setUpLayout: function(layout)
    {
      this.listenTo(this.model, 'reset change', function()
      {
        layout.setActions(this.actions, this);
      });
    },

    onModelEdited: function(transportOrder)
    {
      this.model.set(transportOrder);
    },

    onModelDeleted: function()
    {
      onModelDeleted(this.broker, this.model, null, true);
    },

    markAsSeen: function(e)
    {
      this.$(e.currentTarget).find('.btn').addClass('disabled');
      this.$el.find('.is-changed').removeClass('is-changed');

      this.socket.emit('transportOrders.markAsSeen', this.model.id, function(err)
      {
        if (err)
        {
          console.error(err);
        }
      });

      return false;
    }

  });
});
