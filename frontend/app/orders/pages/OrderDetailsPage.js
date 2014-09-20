// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/user',
  'app/core/View',
  'app/core/util/pageActions',
  'app/core/util/bindLoadingMessage',
  '../views/OrderDetailsView',
  '../views/OrderItemDetailsView',
  'app/orders/templates/detailsPage'
], function(
  t,
  user,
  View,
  pageActions,
  bindLoadingMessage,
  OrderDetailsView,
  OrderItemDetailsView,
  template
) {
  'use strict';

  return View.extend({

    layoutName: 'page',

    template: template,

    breadcrumbs: function()
    {
      return [
        {
          label: t.bound('orders', 'BREADCRUMBS:browse'),
          href: this.model.genClientUrl('base')
        },
        this.model.getLabel()
      ];
    },

    actions: function()
    {
      var model = this.model;

      return [
        pageActions.edit(this.model, function() { return model.isEditable(); }),
        pageActions.delete(this.model, function() { return model.isDeletable(); })
      ];
    },

    initialize: function()
    {
      this.model = bindLoadingMessage(this.model, this);

      this.orderView = new OrderDetailsView({model: this.model});
      this.itemViews = [];

      this.setView('.orders-details-container', this.orderView);

      this.listenTo(this.model.items, 'reset', function()
      {
        this.itemViews.forEach(function(itemView) { itemView.remove(); });
        this.itemViews = [];

        this.model.items.forEach(this.renderItem, this);
      });
    },

    destroy: function()
    {
      this.orderView = null;
      this.itemViews = null;
    },

    load: function(when)
    {
      return when(this.model.fetch());
    },

    renderItem: function(orderItem)
    {
      var itemView = new OrderItemDetailsView({
        collapsed: this.options.selectedItem && this.options.selectedItem !== orderItem.id,
        model: orderItem
      });

      this.itemViews.push(itemView);

      this.insertView('.orders-items-container', itemView);
    }

  });
});
