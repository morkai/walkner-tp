// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var lodash = require('lodash');
var deepEqual = require('deep-equal');
var autoIncrement = require('mongoose-auto-increment');
var userInfoSchema = require('./userInfoSchema');

module.exports = function setUpTransportOrderModel(app, mongoose)
{
  var KINDS = [
    'peopleTransport',
    'airportArrival',
    'airportDeparture',
    'goodsTransport',
    'vehicleService'
  ];

  var USER_PROPERTIES = [
    'owner',
    'tel',
    'symbol',
    'kind',
    'data',
    'userDate',
    'fromAddress',
    'toAddress',
    'quantity',
    'unit',
    'cargo',
    'airport',
    'flightNo',
    'notes'
  ];

  var DISPATCHER_PROPERTIES = [
    'driver',
    'price',
    'status',
    'ownerConfirmed',
    'driverConfirmed',
    'dispatcherConfirmed'
  ];

  var DRIVER_PROPERTIES = [
    'driverDate',
    'km',
    'hours'
  ];

  var changeSchema = mongoose.Schema({
    date: Date,
    user: userInfoSchema,
    data: {},
    comment: String
  }, {
    _id: false
  });

  var transportOrderSchema = mongoose.Schema({
    createdAt: {
      type: Date,
      required: true
    },
    creator: userInfoSchema,
    creatorLastSeenAt: {
      type: Date,
      required: true
    },
    creatorNotify: Boolean,
    creatorChanges: [String],
    owner: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    ownerLastSeenAt: {
      type: Date,
      default: null
    },
    ownerNotify: Boolean,
    ownerChanges: [String],
    dispatcher: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    dispatcherLastSeenAt: {
      type: Date,
      default: null
    },
    dispatcherNotify: Boolean,
    dispatcherChanges: [String],
    driver: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    driverLastSeenAt: {
      type: Date,
      default: null
    },
    driverNotify: Boolean,
    driverChanges: [String],
    users: [{
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    }],
    tel: {
      type: String,
      default: ''
    },
    symbol: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending'
    },
    kind: {
      type: String,
      enum: KINDS,
      required: true
    },
    data: {},
    userDate: {
      type: Date,
      required: true
    },
    driverDate: {
      type: Date,
      default: null
    },
    fromAddress: {
      type: String,
      required: true,
      trim: true
    },
    toAddress: {
      type: String,
      trim: true,
      default: ''
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      trim: true,
      default: 'person'
    },
    cargo: {
      type: String,
      trim: true,
      default: ''
    },
    airport: {
      type: String,
      match: /^[A-Z]{0,3}$/,
      default: ''
    },
    flightNo: {
      type: String,
      trim: true,
      default: ''
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    km: {
      type: Number,
      default: 0,
      min: 0
    },
    hours: {
      type: Number,
      default: 0,
      min: 0
    },
    price: {
      type: Number,
      default: 0,
      min: 0
    },
    ownerConfirmed: {
      type: Boolean,
      default: true
    },
    dispatcherConfirmed: {
      type: Boolean,
      default: false
    },
    driverConfirmed: {
      type: Boolean,
      default: false
    },
    changes: [changeSchema]
  }, {
    id: false
  });

  transportOrderSchema.plugin(autoIncrement.plugin, {
    model: 'TransportOrder',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  transportOrderSchema.statics.TOPIC_PREFIX = 'transportOrders';
  transportOrderSchema.statics.KINDS = KINDS;

  /**
   * @param {object} input
   * @param {UserInfo} creator
   */
  transportOrderSchema.statics.createFromObject = function(input, creator)
  {
    input = lodash.pick(input, USER_PROPERTIES);

    input.creator = creator;
    input.createdAt = new Date();
    input.creatorLastSeenAt = input.createdAt;
    input.creatorChanges = null;

    input.ownerLastSeenAt = input.owner === input.creator ? input.createdAt : null;
    input.ownerChanges = null;

    input.dispatcher = null;
    input.dispatcherLastSeenAt = null;
    input.dispatcherChanges = null;

    input.driver = null;
    input.driverLastSeenAt = null;
    input.driverChanges = null;

    return new this(input);
  };

  /**
   * @param {object} input
   * @param {UserInfo} updater
   * @param {object.<string, boolean>} roles
   * @param {function(object, object): UserInfo} createUserInfo
   * @throws {Error} If owner, dispatcher or driver property is not populated (i.e. is an instance of ObjectId).
   */
  transportOrderSchema.methods.applyChanges = function(input, updater, roles, createUserInfo)
  {
    if (this.owner instanceof mongoose.Types.ObjectId
      || this.dispatcher instanceof mongoose.Types.ObjectId
      || this.driver instanceof mongoose.Types.ObjectId)
    {
      throw new Error("Properties owner, dispatcher and driver must be populated!");
    }

    var inputProperties = this.getInputPropertiesForRoles(roles);
    var updaterId = updater._id.toString();
    var isCreator = updaterId === this.creator._id.toString();
    var isOwner = updaterId === this.owner._id.toString();
    var isDriver = this.driver && updaterId === this.driver._id.toString();

    if (!roles.dispatcher)
    {
      this.prepareConfirmationProperties(input, inputProperties, isCreator || isOwner, isDriver);
    }

    var comment = lodash.isString(input.comment) ? input.comment.trim() : '';
    var changes = this.compareProperties(lodash.pick(input, inputProperties), createUserInfo);
    var changedProperties = Object.keys(changes);

    if (!changedProperties.length && comment === '')
    {
      return null;
    }

    if (changes.driver !== undefined)
    {
      var oldDispatcher = createUserInfo(this.dispatcher, null);

      if (oldDispatcher === null || String(oldDispatcher._id) !== updaterId)
      {
        changes.dispatcher = [oldDispatcher, updater];
        this.dispatcher = updater;
      }
    }

    this.updateLastSeenProperties(changedProperties, changes, updaterId);

    this.changes.push({
      date: new Date(),
      user: updater,
      data: changes || {},
      comment: comment
    });

    return changes;
  };

  /**
   * @param {string} userId
   */
  transportOrderSchema.methods.markAsSeen = function(userId)
  {
    var lastSeenAt = new Date();

    if (userId === (this.creator._id || this.creator).toString())
    {
      this.creatorLastSeenAt = lastSeenAt;
      this.creatorNotify = false;
      this.creatorChanges = null;
    }

    if (userId === (this.owner._id || this.owner).toString())
    {
      this.ownerLastSeenAt = lastSeenAt;
      this.ownerNotify = false;
      this.ownerChanges = null;
    }

    if (this.dispatcher && userId === (this.dispatcher._id || this.dispatcher).toString())
    {
      this.dispatcherLastSeenAt = lastSeenAt;
      this.dispatcherNotify = false;
      this.dispatcherChanges = null;
    }

    if (this.driver && userId === (this.driver._id || this.driver).toString())
    {
      this.driverLastSeenAt = lastSeenAt;
      this.driverNotify = false;
      this.driverChanges = null;
    }
  };

  /**
   * @private
   * @param {object.<string, boolean>} roles
   * @returns {Array.<string>}
   */
  transportOrderSchema.methods.getInputPropertiesForRoles = function(roles)
  {
    var inputProperties = [];

    if (roles.dispatcher || roles.user)
    {
      inputProperties = inputProperties.concat(USER_PROPERTIES);
    }

    if (roles.dispatcher || roles.driver)
    {
      inputProperties = inputProperties.concat(DRIVER_PROPERTIES);
    }

    if (roles.dispatcher)
    {
      inputProperties = inputProperties.concat(DISPATCHER_PROPERTIES);
    }

    return inputProperties;
  };

  /**
   * @private
   * @param {object} input
   * @param {Array.<string>} inputProperties
   * @param {boolean} isUser
   * @param {boolean} isDriver
   */
  transportOrderSchema.methods.prepareConfirmationProperties = function(input, inputProperties, isUser, isDriver)
  {
    if (isUser)
    {
      inputProperties.push('ownerConfirmed');

      if (input.driverConfirm)
      {
        input.driverConfirmed = false;

        inputProperties.push('driverConfirmed');
      }

      if (input.dispatcherConfirm)
      {
        input.dispatcherConfirmed = false;

        inputProperties.push('dispatcherConfirmed');
      }
    }

    if (isDriver)
    {
      inputProperties.push('driverConfirmed');

      if (input.ownerConfirm)
      {
        input.ownerConfirmed = false;

        inputProperties.push('ownerConfirmed');
      }

      if (input.dispatcherConfirm)
      {
        input.dispatcherConfirmed = false;

        inputProperties.push('dispatcherConfirmed');
      }
    }
  };

  /**
   * @private
   * @param {object} input
   * @param {function(object, object): UserInfo} createUserInfo
   * @returns {object|null}
   */
  transportOrderSchema.methods.compareProperties = function(input, createUserInfo)
  {
    var changes = {};
    var properties = Object.keys(input);

    if (lodash.isString(input.status))
    {
      properties = lodash.without(properties, 'status');
      properties.push('status');
    }

    for (var i = 0, l = properties.length; i < l; ++i)
    {
      this.compareProperty(properties[i], input, changes, createUserInfo);
    }

    var statusChanged = changes.status === undefined;
    var isUnresolved = this.status !== 'completed' && this.status !== 'cancelled';
    var confirmationChanged = changes.ownerConfirmed !== undefined
      || changes.dispatcherConfirmed !== undefined
      || changes.driverConfirmed !== undefined;

    if (statusChanged && isUnresolved && confirmationChanged)
    {
      var oldStatus = this.status;
      var newStatus = this.ownerConfirmed && this.dispatcherConfirmed && this.driverConfirmed ? 'confirmed' : 'pending';

      if (oldStatus !== newStatus)
      {
        changes.status = [oldStatus, newStatus];
        this.status = newStatus;
      }
    }

    return changes;
  };

  /**
   * @private
   * @param {string} property
   * @param {object} input
   * @param {object} changes
   * @param {function(object, object): UserInfo} createUserInfo
   */
  transportOrderSchema.methods.compareProperty = function(property, input, changes, createUserInfo)
  {
    var oldValue = this[property];
    var newValue = input[property];
    var oldValueChange;
    var newValueChange;

    if (oldValue instanceof mongoose.Types.ObjectId)
    {
      oldValue = oldValue.toString();
    }
    else if (property === 'owner' || property === 'dispatcher' || property === 'driver')
    {
      newValueChange = createUserInfo(newValue);
      newValue = newValue && newValue._id ? newValue._id.toString() : null;
      oldValueChange = createUserInfo(oldValue);
      oldValue = oldValue === null ? null : oldValue._id.toString();
    }
    else if (property === 'userDate' || property === 'driverDate')
    {
      newValue = newValue ? new Date(newValue) : null;

      if (newValue !== null && isNaN(newValue.getTime()))
      {
        newValue = null;
      }
    }
    else if (property === 'status' && newValue === 'open')
    {
      newValue = this.ownerConfirmed && this.dispatcherConfirmed && this.driverConfirmed ? 'confirmed' : 'pending';
    }
    else if (lodash.isString(newValue))
    {
      newValue = newValue.trim();
    }

    if (!deepEqual(newValue, oldValue))
    {
      changes[property] = [
        oldValueChange === undefined ? oldValue : oldValueChange,
        newValueChange === undefined ? newValue : newValueChange
      ];

      this[property] = newValue;
    }
  };

  /**
   * @private
   * @param {Array.<string>} changedProperties
   * @param {object} changes
   * @param {string} updaterId
   */
  transportOrderSchema.methods.updateLastSeenProperties = function(changedProperties, changes, updaterId)
  {
    var creatorId = this.creator._id.toString();
    var ownerId = (this.owner._id || this.owner).toString();
    var dispatcherId = this.dispatcher ? (this.dispatcher._id || this.dispatcher).toString() : null;
    var driverId = this.driver ? (this.driver._id || this.driver).toString() : null;
    var now = new Date();

    if (creatorId === updaterId)
    {
      this.creatorLastSeenAt = now;
      this.creatorNotify = false;
      this.creatorChanges = null;
    }
    else
    {
      this.creatorNotify = true;
      this.creatorChanges = lodash.uniq([].concat(this.creatorChanges || [], changedProperties));
    }

    if (ownerId === updaterId)
    {
      this.ownerLastSeenAt = now;
      this.ownerNotify = false;
      this.ownerChanges = null;
    }
    else
    {
      this.ownerNotify = true;
      this.ownerChanges = changes.owner ? null : lodash.uniq([].concat(this.ownerChanges || [], changedProperties));
    }

    if (!dispatcherId || dispatcherId === updaterId)
    {
      this.dispatcherLastSeenAt = now;
      this.dispatcherNotify = false;
      this.dispatcherChanges = null;
    }
    else
    {
      this.dispatcherNotify = true;
      this.dispatcherChanges = changes.dispatcher
        ? null
        : lodash.uniq([].concat(this.dispatcherChanges || [], changedProperties));
    }

    if (!driverId || driverId === updaterId)
    {
      this.driverLastSeenAt = now;
      this.driverNotify = false;
      this.driverChanges = null;
    }
    else
    {
      this.driverNotify = true;
      this.driverChanges = changes.driver ? null : lodash.uniq([].concat(this.driverChanges || [], changedProperties));
    }
  };

  /**
   * @private
   */
  transportOrderSchema.methods.updateUsers = function()
  {
    var newUsers = {};
    var oldUsers = this.users.map(String);

    newUsers[this.creator._id || this.creator] = true;
    newUsers[this.owner._id || this.owner] = true;

    if (this.dispatcher !== null)
    {
      newUsers[this.dispatcher._id || this.dispatcher] = true;
    }

    if (this.driver !== null)
    {
      newUsers[this.driver._id || this.driver] = true;
    }

    newUsers = Object.keys(newUsers).sort();

    if (!deepEqual(oldUsers, newUsers))
    {
      this.users = newUsers;
    }
  };

  transportOrderSchema.pre('save', function(next)
  {
    this.wasNew = this.isNew;

    this.updateUsers();

    next();
  });

  transportOrderSchema.post('save', function(transportOrder)
  {
    app.broker.publish('transportOrders.' + (this.wasNew ? 'added' : 'edited'), transportOrder);
  });

  mongoose.model('TransportOrder', transportOrderSchema);
};
