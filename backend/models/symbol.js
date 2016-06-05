// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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
