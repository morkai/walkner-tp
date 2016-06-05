// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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

    nlsDomain: 'reports',

    defaults: function()
    {
      return {
        _id: 'user',
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
