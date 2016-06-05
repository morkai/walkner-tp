// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

var userInfoSchema = require('./userInfoSchema');

module.exports = function setUpPasswordResetRequestModel(app, mongoose)
{
  var passwordResetRequest = mongoose.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    createdAt: {
      type: Date,
      required: true
    },
    creator: userInfoSchema,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    password: {
      type: String,
      required: true
    }
  }, {
    id: false
  });

  mongoose.model('PasswordResetRequest', passwordResetRequest);
};
