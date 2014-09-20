// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var autoIncrement = require('mongoose-auto-increment');

module.exports = function setUpOrderItemModel(app, mongoose)
{
  var KINDS = [
    'peopleTransport',
    'airportArrival',
    'airportDeparture',
    'goodsTransport',
    'vehicleService'
  ];

  var changeSchema = mongoose.Schema({
    date: Date,
    user: {},
    data: {},
    comment: String
  }, {
    _id: false
  });

  var orderItemSchema = mongoose.Schema({
    order: {
      ref: 'Order',
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    owner: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    driver: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    },
    users: [{
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    }],
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
    symbol: {
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

  orderItemSchema.plugin(autoIncrement.plugin, {
    model: 'OrderItem',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  orderItemSchema.statics.TOPIC_PREFIX = 'orderItems';
  orderItemSchema.statics.KINDS = KINDS;

  orderItemSchema.pre('save', function(next)
  {
    /*jshint validthis:true*/

    if (!this.ownerConfirmed || !this.dispatcherConfirmed || !this.driverConfirmed)
    {
      this.status = 'pending';
    }
    else if (this.status !== 'completed' && this.status !== 'cancelled')
    {
      this.status = 'confirmed';
    }

    next();
  });

  orderItemSchema.methods.updateUsers = function()
  {
    var users = {};

    users[this.creator] = true;
    users[this.owner] = true;

    if (this.driver)
    {
      users[this.driver] = true;
    }

    this.set('users', Object.keys(users));
  };

  mongoose.model('OrderItem', orderItemSchema);
};
