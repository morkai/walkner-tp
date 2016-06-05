// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Setting'
], function(
  Collection,
  Setting
) {
  'use strict';

  return Collection.extend({

    model: Setting,

    rqlQuery: 'select(value)',

    matchSettingId: null,

    topicSuffix: '**',

    initialize: function(models, options)
    {
      if (options.pubsub)
      {
        this.setUpPubsub(options.pubsub);
      }
    },

    setUpPubsub: function(pubsub)
    {
      var collection = this;

      pubsub.subscribe('settings.updated.' + this.topicSuffix, function(changes)
      {
        var setting = collection.get(changes._id);

        if (setting)
        {
          setting.set(changes);
        }
        else
        {
          collection.add(changes);
        }
      });
    }

  });
});
