// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'h5.rql/index',
  '../core/Model'
], function(
  _,
  rql,
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/reports/tp',

    clientUrlRoot: '#reports/tp',

    defaults: function()
    {
      return {
        _id: 'symbol',
        collection: [],
        km: 0,
        hours: 0,
        price: 0.00
      };
    },

    initialize: function(data, options)
    {
      if (!options.rqlQuery)
      {
        throw new Error("rqlQuery option is required!");
      }

      this.rqlQuery = options.rqlQuery;
    },

    fetch: function(options)
    {
      if (!_.isObject(options))
      {
        options = {};
      }

      options.data = this.rqlQuery.toString();

      return Model.prototype.fetch.call(this, options);
    }

  });
});
