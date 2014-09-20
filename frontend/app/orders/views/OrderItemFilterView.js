// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/user',
  'app/users/util/setUpUserSelect2',
  'app/core/views/FilterView',
  'app/orders/templates/itemFilter'
], function(
  user,
  setUpUserSelect2,
  FilterView,
  template
) {
  'use strict';

  return FilterView.extend({

    template: template,

    minLimit: 1,

    defaultFormData: {
      status: ['pending', 'confirmed', 'completed', 'cancelled']
    },

    termToForm: {
      'status': function(propertyName, term, formData)
      {
        formData[propertyName] = [].concat(term.args[1]);
      }
    },

    serializeFormToQuery: function(selector)
    {
      var status = this.getButtonGroupValue('status');

      if (status.length === 1)
      {
        selector.push({name: 'eq', args: ['status', status[0]]});
      }
      else if (status.length > 0 && status.length < 4)
      {
        selector.push({name: 'in', args: ['status', status]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.call(this);

      this.toggleButtonGroup('status');
    }

  });
});
