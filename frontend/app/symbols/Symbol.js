// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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
