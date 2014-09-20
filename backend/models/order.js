// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var step = require('h5.step');
var autoIncrement = require('mongoose-auto-increment');

module.exports = function setUpOrderModel(app, mongoose)
{
  var changeSchema = mongoose.Schema({
    date: Date,
    user: {},
    data: {}
  }, {
    _id: false
  });

  var orderSchema = mongoose.Schema({
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
    users: [{
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId
    }],
    status: {
      type: String,
      enum: ['open', 'completed'],
      default: 'open'
    },
    subject: {
      type: String,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    tel: {
      type: String,
      default: ''
    },
    changes: [changeSchema]
  }, {
    id: false
  });

  orderSchema.plugin(autoIncrement.plugin, {
    model: 'Order',
    field: 'rid',
    startAt: 1,
    incrementBy: 1
  });

  orderSchema.statics.TOPIC_PREFIX = 'orders';

  orderSchema.statics.updateUsers = function(orderId, done)
  {
    step(
      function()
      {
        mongoose.model('Order').findById(orderId, {creator: 1, owner: 1, users: 1}).exec(this.parallel());
        mongoose.model('OrderItem').find({order: orderId}, {creator: 1, owner: 1, driver: 1}).exec(this.parallel());
      },
      function(err, order, orderItems)
      {
        if (err)
        {
          return this.skip(err);
        }

        order.updateUsers(orderItems);
        order.save(this.next());
      },
      done
    );
  };

  orderSchema.methods.updateUsers = function(itemModels)
  {
    var users = {};

    users[this.creator] = true;
    users[this.owner] = true;

    itemModels.forEach(function(itemModel)
    {
      if (itemModel.driver)
      {
        users[itemModel.creator] = true;
        users[itemModel.owner] = true;
        users[itemModel.driver] = true;
      }
    });

    this.set('users', Object.keys(users));
  };

  mongoose.model('Order', orderSchema);
};
