// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  '../time',
  '../user',
  '../core/Model',
  './OrderItemCollection',
  'app/orders/templates/user'
], function(
  _,
  time,
  user,
  Model,
  OrderItemCollection,
  renderUser
) {
  'use strict';

  return Model.extend({

    urlRoot: '/orders',

    clientUrlRoot: '#orders',

    topicPrefix: 'orders',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'orders',

    labelAttribute: 'rid',

    defaults: {

    },

    initialize: function()
    {
      this.items = new OrderItemCollection(this.get('items'));
    },

    parse: function(res)
    {
      if (this.items)
      {
        this.items.reset(res.items);
      }

      return res;
    },

    serialize: function()
    {
      var obj = this.toJSON();

      if (obj.creator === null)
      {
        obj.creator = {
          firstName: 'root',
          lastName: ''
        };
      }

      obj.rowClassName = obj.status === 'completed' ? 'success' : '';
      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = _.isObject(obj.creator) ? renderUser({user: obj.creator}) : obj.creator;
      obj.owner = _.isObject(obj.owner) ? renderUser({user: obj.owner}) : obj.owner;

      return obj;
    },

    isResolved: function()
    {
      return this.get('status') === 'completed';
    },

    isUser: function()
    {
      return _.contains(this.get('users'), function(orderUser)
      {
        if (typeof orderUser === 'string')
        {
          return orderUser === user.data._id;
        }

        return orderUser && orderUser._id === user.data._id;
      });
    },

    isEditable: function()
    {
      return user.isAllowedTo('ORDERS:DISPATCHER') || this.isCreator() || this.isOwner();
    },

    isDeletable: function()
    {
      return user.data.super || (!this.isResolved() && user.isAllowedTo('ORDERS:DISPATCHER'));
    },

    isCreator: function()
    {
      return user.data._id === this.getCreatorId();
    },

    isOwner: function()
    {
      return user.data._id === this.getOwnerId();
    },

    /**
     * @returns {string|null}
     */
    getCreatorId: function()
    {
      return this.getUserId('creator');
    },

    /**
     * @returns {string|null}
     */
    getOwnerId: function()
    {
      return this.getUserId('owner');
    },

    /**
     * @private
     * @param {string} property
     * @returns {string|null}
     */
    getUserId: function(property)
    {
      var data = this.get(property);

      if (typeof data === 'string')
      {
        return data;
      }

      return data && data._id ? data._id : null;
    }

  });
});
