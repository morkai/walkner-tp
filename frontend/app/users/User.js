// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

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
      login: null,
      email: null,
      privileges: null,
      firstName: null,
      lastName: null,
      tel: null,
      symbol: null
    },

    initialize: function()
    {
      if (!Array.isArray(this.get('privileges')))
      {
        this.set('privileges', []);
      }
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
