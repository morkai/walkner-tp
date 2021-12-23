// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FilterView',
  'app/symbols/util/setUpSymbolSelect2',
  'app/users/util/setUpUserSelect2',
  'app/users/templates/filter'
], function(
  FilterView,
  setUpSymbolSelect2,
  setUpUserSelect2,
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
      'searchName': function(propertyName, term, formData)
      {
        formData[propertyName] = this.unescapeRegExp(term.args[1]).replace(/^\^/, '');
      },
      'symbol': function(propertyName, term, formData)
      {
        formData[propertyName] = term.args[1];
      }
    },

    serializeFormToQuery: function(selector)
    {
      const searchName = setUpUserSelect2.transliterate(this.$id('searchName').val());

      if (searchName.length)
      {
        selector.push({name: 'regex', args: ['searchName', `^${searchName}`]});
      }

      const symbol = this.$id('symbol').val();

      if (symbol.length)
      {
        selector.push({name: 'eq', args: ['symbol', symbol]});
      }
    },

    afterRender: function()
    {
      FilterView.prototype.afterRender.apply(this, arguments);

      setUpSymbolSelect2(this.$id('symbol'), {
        width: '250px'
      });
    }

  });
});
