// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/users/templates/filter'
], function(
  FilterView,
  filterTemplate
) {
  'use strict';

  return FilterView.extend({

    template: filterTemplate,

    defaultFormData: {
      lastName: '',
      symbol: ''
    },

    termToForm: {
      'lastName': function(propertyName, term, formData)
      {
        if (term.name === 'regex')
        {
          formData[propertyName] = term.args[1].replace('^', '');
        }
      },
      'symbol': 'lastName'
    },

    serializeFormToQuery: function(selector)
    {
      var lastName = this.$id('lastName').val().trim();
      var symbol = this.$id('symbol').val().trim();

      if (lastName.length)
      {
        selector.push({name: 'regex', args: ['lastName', '^' + lastName, 'i']});
      }

      if (symbol.length)
      {
        selector.push({name: 'regex', args: ['symbol', '^' + symbol, 'i']});
      }
    }

  });
});
