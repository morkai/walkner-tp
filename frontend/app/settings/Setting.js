// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Model'
], function(
  Model
) {
  'use strict';

  return Model.extend({

    urlRoot: '/settings',

    clientUrlRoot: '#settings',

    topicPrefix: 'settings',

    privilegePrefix: 'SETTINGS',

    nlsDomain: 'settings',

    defaults: {
      value: null
    },

    getValue: function()
    {
      return this.get('value');
    }

  });
});
