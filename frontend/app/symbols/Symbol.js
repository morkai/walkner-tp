// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  var NO_PREFIX_REG_EXP = new RegExp('^PL02');

  return Model.extend({

    urlRoot: '/symbols',

    clientUrlRoot: '#symbols',

    topicPrefix: 'symbols',

    privilegePrefix: 'DICTIONARIES',

    nlsDomain: 'symbols',

    labelAttribute: '_id',

    defaults: {
      group: null,
      name: null
    },

    getLabel: function()
    {
      return this.get('name') + ' (' + this.getShortId() + ')';
    },

    getShortId: function()
    {
      return this.constructor.makeShortId(this.id);
    }

  }, {

    makeShortId: function(fullId)
    {
      return fullId.replace(NO_PREFIX_REG_EXP, '');
    }

  });
});
