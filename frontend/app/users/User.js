// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model',
  '../data/symbols'
], function(
  Model,
  symbols
) {
  'use strict';

  return Model.extend({

    urlRoot: '/users',

    clientUrlRoot: '#users',

    topicPrefix: 'users',

    privilegePrefix: 'USERS',

    nlsDomain: 'users',

    labelAttribute: 'login',

    defaults: {
      privileges: []
    },

    getLabel: function()
    {
      var lastName = this.get('lastName') || '';
      var firstName = this.get('firstName') || '';

      return lastName.length && firstName.length ? (lastName + ' ' + firstName) : this.get('login');
    },

    serialize: function()
    {
      return this.toJSON();
    },

    serializeDetails: function()
    {
      var obj = this.toJSON();

      obj.symbol = symbols.getLabel(obj.symbol);

      return obj;
    },

    serializeRow: function()
    {
      return this.serializeDetails();
    }

  });
});
