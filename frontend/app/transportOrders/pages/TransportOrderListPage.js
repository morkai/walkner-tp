// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/user',
  'app/core/pages/FilteredListPage',
  'app/core/util/pageActions',
  '../views/TransportOrderFilterView',
  '../views/TransportOrderTableView'
], function(
  $,
  user,
  FilteredListPage,
  pageActions,
  TransportOrderFilterView,
  TransportOrderTableView
) {
  'use strict';

  return FilteredListPage.extend({

    FilterView: TransportOrderFilterView,

    ListView: TransportOrderTableView,

    actions: function()
    {
      var actions = [pageActions.jump(this, this.collection)];

      if (user.isAllowedTo('TRANSPORT_ORDERS:USER'))
      {
        actions.push(pageActions.add(this.collection, null));
      }

      return actions;
    },

    initialize: function()
    {
      FilteredListPage.prototype.initialize.call(this);

      this.collection.setComparator();
      this.collection.subscribe(this.broker);

      this.listenTo(this.collection, 'dirty', function()
      {
        this.listView.refreshCollection(null, {reset: false});
      });

      this.listenTo(this.filterView, 'filterChanged', function()
      {
        this.collection.setComparator();
      });
    },

    afterRender: function()
    {
      FilteredListPage.prototype.afterRender.call(this);

      if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
      {
        $('.page-actions-jump .form-control').focus();
      }
    }

  });
});
