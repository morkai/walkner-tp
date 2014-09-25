// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  '../time',
  '../i18n',
  '../user',
  '../core/Model'
], function(
  _,
  time,
  t,
  user,
  Model
) {
  'use strict';

  var KIND_TO_UNIT = {
    peopleTransport: 'person',
    airportArrival: 'person',
    airportDeparture: 'person',
    goodsTransport: 'kg',
    vehicleService: 'vehicle'
  };

  var STATUS_TO_CLASS = {
    pending: 'warning',
    confirmed: 'info',
    completed: 'success',
    cancelled: 'danger'
  };

  return Model.extend({

    urlRoot: '/transportOrders',

    clientUrlRoot: '#transportOrders',

    topicPrefix: 'transportOrders',

    privilegePrefix: 'TRANSPORT_ORDERS',

    nlsDomain: 'transportOrders',

    labelAttribute: 'rid',

    defaults: function()
    {
      return {
        quantity: 1,
        km: 0,
        hours: 0,
        price: 0,
        changedProperties: {}
      };
    },

    initialize: function()
    {
      var kind = this.get('kind');

      if (!this.get('unit') && KIND_TO_UNIT[kind])
      {
        this.set('unit', KIND_TO_UNIT[kind]);
      }

      this.on('reset change', this.prepareChangedProperties);

      this.prepareChangedProperties();
    },

    /**
     * @returns {boolean}
     */
    isResolved: function()
    {
      var status = this.get('status');

      return status === 'completed' || status === 'cancelled';
    },

    /**
     * @returns {boolean}
     */
    isNotSeen: function()
    {
      return !_.isEmpty(this.get('changedProperties'));
    },

    /**
     * @returns {boolean}
     */
    isParticipant: function()
    {
      return _.contains(this.get('users'), user.data._id);
    },

    /**
     * @returns {boolean}
     */
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

      if (!this.get('dispatcherConfirmed') && user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'))
      {
        return true;
      }

      return !this.get('driverConfirmed') && this.isDriver();
    },

    /**
     * @returns {boolean}
     */
    isEditable: function()
    {
      if (user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'))
      {
        return true;
      }

      if (this.isResolved())
      {
        return false;
      }

      return this.isDriver() || this.isCreator() || this.isOwner();
    },

    /**
     * @returns {boolean}
     */
    isDeletable: function()
    {
      return user.data.super || (!this.isResolved() && user.isAllowedTo('TRANSPORT_ORDERS:DISPATCHER'));
    },

    /**
     * @returns {boolean}
     */
    isCreator: function()
    {
      return user.data._id === this.getCreatorId();
    },

    /**
     * @returns {boolean}
     */
    isOwner: function()
    {
      return user.data._id === this.getOwnerId();
    },

    /**
     * @returns {boolean}
     */
    isDispatcher: function()
    {
      return user.data._id === this.getDispatcherId();
    },

    /**
     * @returns {boolean}
     */
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
    getDispatcherId: function()
    {
      return this.getUserId('dispatcher');
    },

    /**
     * @returns {string|null}
     */
    getDriverId: function()
    {
      return this.getUserId('driver');
    },

    /**
     * @returns {string}
     */
    getStatusClassName: function()
    {
      return STATUS_TO_CLASS[this.get('status')] || '';
    },

    /**
     * @returns {number}
     */
    getLastSeenAt: function()
    {
      var lastSeenAt;

      if (this.isCreator())
      {
        lastSeenAt = this.get('creatorLastSeenAt');
      }
      else if (this.isOwner())
      {
        lastSeenAt = this.get('ownerLastSeenAt');
      }
      else if (this.isDispatcher())
      {
        lastSeenAt = this.get('dispatcherLastSeenAt');
      }
      else if (this.isDriver())
      {
        lastSeenAt = this.get('driverLastSeenAt');
      }

      if (lastSeenAt === undefined)
      {
        return -1;
      }

      if (lastSeenAt === null)
      {
        return 0;
      }

      return time.getMoment(lastSeenAt).valueOf();
    },

    markAsSeen: function()
    {
      var changes = {
        changedProperties: null
      };
      var userTypes = [];

      if (this.isCreator())
      {
        userTypes.push('creator');
      }

      if (this.isOwner())
      {
        userTypes.push('owner');
      }

      if (this.isDispatcher())
      {
        userTypes.push('dispatcher');
      }

      if (this.isDriver())
      {
        userTypes.push('driver');
      }

      var lastSeenAt = new Date();

      userTypes.forEach(function(userType)
      {
        changes[userType + 'LastSeenAt'] = lastSeenAt;
        changes[userType + 'Notify'] = false;
        changes[userType + 'Changes'] = null;
      });

      this.set(changes);
    },

    /**
     * @private
     * @returns {object.<string, boolean>}
     */
    prepareChangedProperties: function()
    {
      var changes = {};

      if (this.isDispatcher())
      {
        changes = _.defaults(changes, this.getChangedPropertiesForUser('dispatcher'));
      }

      if (this.isDriver())
      {
        changes = _.defaults(changes, this.getChangedPropertiesForUser('driver'));
      }

      if (this.isCreator())
      {
        changes = _.defaults(changes, this.getChangedPropertiesForUser('creator'));
      }

      if (this.isOwner())
      {
        changes = _.defaults(changes, this.getChangedPropertiesForUser('owner'));
      }

      this.attributes.changedProperties = changes;
    },

    /**
     * @private
     * @param {string} userProperty
     * @returns {object.<string, boolean>}
     */
    getChangedPropertiesForUser: function(userProperty)
    {
      var changes = {};

      if (!this.get(userProperty + 'Notify'))
      {
        return changes;
      }

      var changedProperties = this.get(userProperty + 'Changes');

      if (changedProperties === null)
      {
        changes.all = true;
      }
      else
      {
        for (var i = 0, l = changedProperties.length; i < l; ++i)
        {
          changes[changedProperties[i]] = true;
        }
      }

      return changes;
    },

    /**
     * @private
     * @param {string} userProperty
     * @returns {string|null}
     */
    getUserId: function(userProperty)
    {
      var userData = this.get(userProperty);

      if (typeof userData === 'string')
      {
        return userData;
      }

      return userData && userData._id ? userData._id : null;
    }

  });
});
