// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

'use strict';

module.exports = function setUpUserModel(app, mongoose)
{
  var userSchema = mongoose.Schema({
    login: {
      type: String,
      trim: true,
      required: true,
      unique: true
    },
    password: {
      type: String,
      trim: true,
      required: true
    },
    email: String,
    tel: String,
    symbol: String,
    privileges: [String],
    firstName: String,
    lastName: String
  }, {
    id: false,
    toJSON: {
      transform: function(alarm, ret)
      {
        delete ret.password;

        return ret;
      }
    }
  });

  userSchema.index({lastName: 1});
  userSchema.index({login: 1});
  userSchema.index({email: 1});
  userSchema.index({symbol: 1});
  userSchema.index({privileges: 1});

  userSchema.statics.TOPIC_PREFIX = 'users';

  userSchema.statics.customizeLeanObject = function(leanModel)
  {
    if (leanModel)
    {
      delete leanModel.password;
    }

    return leanModel;
  };

  mongoose.model('User', userSchema);
};
