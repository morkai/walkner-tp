// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

'use strict';

module.exports = function setupSymbolModel(app, mongoose)
{
  var symbolSchema = mongoose.Schema({
    _id: {
      type: String,
      required: true
    },
    group: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      trim: true
    }
  }, {
    id: false
  });

  symbolSchema.statics.TOPIC_PREFIX = 'symbols';

  mongoose.model('Symbol', symbolSchema);
};
