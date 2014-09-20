// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/user',
  'app/core/views/ListView',
  'app/core/views/PaginationView',
  'app/orders/templates/itemList',
  './OrderItemDetailsView'
], function(
  user,
  ListView,
  PaginationView,
  template,
  OrderItemDetailsView
) {
  'use strict';

  return ListView.extend({

    template: template,

    initialize: function()
    {
      this.paginationView = new PaginationView({
        model: this.collection.paginationData
      });

      this.setView('.pagination-container', this.paginationView);

      this.listenTo(this.collection.paginationData, 'change:page', this.scrollTop);
    },

    beforeRender: function()
    {
      this.stopListening(this.collection, 'reset', this.render);
    },

    afterRender: function()
    {
      this.listenToOnce(this.collection, 'reset', this.render);

      this.collection.forEach(this.renderItem, this);
    },

    renderItem: function(orderItem)
    {
      var itemView = new OrderItemDetailsView({
        keep: false,
        model: orderItem
      });

      this.insertView('.orderItems-container', itemView).render();
    },

    serialize: function()
    {
      return {
        idPrefix: this.idPrefix
      };
    }

  });
});
