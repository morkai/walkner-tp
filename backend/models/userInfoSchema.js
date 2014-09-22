// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

var mongoose = require('mongoose');

module.exports = {
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  ip: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    required: true
  }
};
