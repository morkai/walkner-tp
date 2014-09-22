// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'moment',
  '../core/Collection',
  './TransportOrder'
], function(
  moment,
  Collection,
  TransportOrder
) {
  'use strict';

  return Collection.extend({

    model: TransportOrder,

    rqlQuery: 'sort(userDate)&limit(15)&status=in=(pending,confirmed)',

    setComparator: function()
    {
      var sort = this.rqlQuery.sort;

      if (!sort.userDate && !sort.driverDate)
      {
        this.comparator = null;

        return;
      }

      var dateProperty = sort.userDate ? 'userDate' : 'driverDate';

      this.comparator = sort[dateProperty] === 1
        ? function(a, b) { return moment(a.get(dateProperty)).diff(b.get(dateProperty)); }
        : function(b, a) { return moment(a.get(dateProperty)).diff(b.get(dateProperty)); };
    },

    subscribe: function(broker)
    {
      broker.subscribe('transportOrders.added.*', this.onAdded.bind(this));
      broker.subscribe('transportOrders.edited.*', this.onEdited.bind(this));
      broker.subscribe('transportOrders.deleted.*', this.onDeleted.bind(this));
    },

    onAdded: function(obj)
    {
      if (!this.matchesRqlQuery(obj))
      {
        return;
      }

      if (this.rqlQuery.skip === 0 && this.length < this.rqlQuery.limit)
      {
        this.add(obj);
      }
      else
      {
        this.trigger('dirty');
      }
    },

    onEdited: function(obj)
    {
      var transportOrder = this.get(obj._id);
      var local = !!transportOrder;

      if (local && (obj.__v > this.get('__v') || !this.get('__v')))
      {
        transportOrder.set(obj);
      }

      var matches = this.matchesRqlQuery(obj);

      if ((matches && !local) || (!matches && local))
      {
        this.trigger('dirty');
      }
    },

    onDeleted: function(obj)
    {
      var transportOrder = this.get(obj._id);

      if (transportOrder)
      {
        this.remove(transportOrder);
        this.trigger('dirty');
      }
      else if (this.matchesRqlQuery(obj))
      {
        this.trigger('dirty');
      }
    }

  });
});
