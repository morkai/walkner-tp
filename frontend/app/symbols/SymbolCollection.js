// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  '../core/Collection',
  './Symbol'
], function(
  Collection,
  Symbol
) {
  'use strict';

  return Collection.extend({

    model: Symbol,

    rqlQuery: 'sort(group,_id)',

    comparator: function(a, b)
    {
      var cmp  = a.attributes.group.localeCompare(b.attributes.group);

      if (cmp === 0)
      {
        cmp = a.attributes._id.localeCompare(b.attributes._id);
      }

      return cmp;
    },

    initialize: function()
    {
      this.multipleSelect2Counter = 0;
    },

    makeShortId: function(fullId)
    {
      return Symbol.makeShortId(fullId);
    },

    getLabel: function(id)
    {
      var symbol = this.get(id);

      return symbol ? symbol.getLabel() : id;
    },

    /**
     * @param {string} [idPrefix]
     * @returns {Array.<object>}
     */
    serializeToSingleSelect2: function(idPrefix)
    {
      if (idPrefix === undefined)
      {
        idPrefix = '';
      }

      var data = [];
      var lastGroup = {text: null};

      this.forEach(function(symbol)
      {
        var group = symbol.get('group');

        if (lastGroup.text !== group)
        {
          lastGroup = {
            text: group,
            children: []
          };

          data.push(lastGroup);
        }

        lastGroup.children.push({
          id: idPrefix + symbol.id,
          text: symbol.get('name')
        });
      });

      return {
        results: data
      };
    },

    /**
     * @returns {{results: Array.<object>}}
     */
    serializeToMultipleSelect2: function()
    {
      ++this.multipleSelect2Counter;

      return this.serializeToSingleSelect2(this.multipleSelect2Counter + '$');
    }

  });
});
