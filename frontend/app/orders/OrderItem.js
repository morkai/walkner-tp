// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../time',
  '../i18n',
  '../user',
  '../core/Model',
  'app/orders/templates/user'
], function(
  time,
  t,
  user,
  Model,
  renderUser
) {
  'use strict';

  var KIND_TO_UNIT = {
    peopleTransport: 'person',
    airportArrival: 'person',
    airportDeparture: 'person',
    goodsTransport: 'kg',
    vehicleService: 'vehicle'
  };

  var STATUS_TO_PANEL_TYPE = {
    pending: 'warning',
    confirmed: 'primary',
    completed: 'success',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/orderItems',

    clientUrlRoot: '#orderItems',

    topicPrefix: 'orderItems',

    privilegePrefix: 'ORDERS',

    nlsDomain: 'orders',

    labelAttribute: 'rid',

    defaults: {
      quantity: 1,
      km: 0,
      hours: 0,
      price: 0
    },

    initialize: function()
    {
      if (!this.get('unit') && KIND_TO_UNIT[this.get('kind')])
      {
        this.set('unit', KIND_TO_UNIT[this.get('kind')]);
      }
    },

    serialize: function()
    {
      var obj = this.toJSON();

      var userMoment = obj.userDate ? time.getMoment(obj.userDate) : null;
      var driverMoment = obj.driverDate ? time.getMoment(obj.driverDate) : null;

      obj.userDate = userMoment && userMoment.isValid() ? userMoment.format('YYYY-MM-DD') : null;
      obj.userTime = userMoment && userMoment.isValid() ? userMoment.format('HH:mm') : null;
      obj.driverDate = driverMoment && driverMoment.isValid() ? driverMoment.format('YYYY-MM-DD') : null;
      obj.driverTime = driverMoment && driverMoment.isValid() ? driverMoment.format('HH:mm') : null;

      return obj;
    },

    serializeDetails: function()
    {
      var obj = this.serialize();

      obj.panelType = STATUS_TO_PANEL_TYPE[obj.status] || 'default';
      obj.kindText = t.bound('orders', 'itemKind:' + obj.kind);

      if (obj.creator === null)
      {
        obj.creator = {
          firstName: 'root',
          lastName: ''
        };
      }

      obj.createdAt = time.format(obj.createdAt, 'LLLL');
      obj.creator = _.isObject(obj.creator) ? renderUser({user: obj.creator}) : obj.creator;
      obj.owner = _.isObject(obj.owner) ? renderUser({user: obj.owner}) : obj.owner;
      obj.driver = _.isObject(obj.driver) ? renderUser({user: obj.driver}) : '-';

      obj.quantity = obj.quantity.toLocaleString();
      obj.unit = t.has('orders', 'unit:' + obj.unit) ? t.bound('orders', 'unit:' + obj.unit) : obj.unit;

      obj.km = obj.km.toLocaleString();
      obj.hours = obj.hours.toLocaleString();
      obj.price = obj.price.toLocaleString();

      return obj;
    },

    getOrderId: function()
    {
      var order = this.get('order');

      return order && order._id ? order._id : order;
    },

    isResolved: function()
    {
      var status = this.get('status');

      return status === 'completed' || status === 'cancelled';
    },

    isUser: function()
    {
      return _.contains(this.get('users'), function(orderItemUser)
      {
        if (typeof orderItemUser === 'string')
        {
          return orderItemUser === user.data._id;
        }

        return orderItemUser && orderItemUser._id === user.data._id;
      });
    },

    isConfirmable: function()
    {
      if (this.get('status') !== 'pending')
      {
        return false;
      }

      if (!this.get('ownerConfirmed') && (this.isCreator() || this.isOwner()))
      {
        return true;
      }

      if (!this.get('dispatcherConfirmed') && user.isAllowedTo('ORDERS:DISPATCHER'))
      {
        return true;
      }

      return !this.get('driverConfirmed') && this.isDriver();
    },

    isEditable: function()
    {
      return user.isAllowedTo('ORDERS:DISPATCHER') || this.isDriver() || this.isCreator() || this.isOwner();
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

    isDriver: function()
    {
      return user.data._id === this.getDriverId();
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
     * @returns {string|null}
     */
    getDriverId: function()
    {
      return this.getUserId('driver');
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
