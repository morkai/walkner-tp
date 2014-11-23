// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'jquery',
  'select2',
  'app/data/symbols'
], function(
  _,
  $,
  Select2,
  symbols
) {
  'use strict';

  var multiplier = 1;
  var setMultiplier = true;

  function formatSelection(item)
  {
    /*jshint validthis:true*/

    return format.call(this, item, true);
  }

  function formatResult(item)
  {
    /*jshint validthis:true*/

    return format.call(this, item, false);
  }

  function format(item, displayMultiplier)
  {
    /*jshint validthis:true*/

    var id = item.id;

    if (!id)
    {
      return item.text;
    }

    if (this.multiple)
    {
      id = id.replace(/^\$?[0-9]+\$/, '');

      item.symbol = id;

      if (setMultiplier)
      {
        item.multiplier = multiplier;
      }
    }
    else
    {
      item.symbol = id;
    }

    var result = '';

    if (displayMultiplier && item.multiplier > 1)
    {
      result += '<span class="symbol-multiplier">' + item.multiplier + 'x</span> ';
    }

    result += '<code class="symbol-id">' + symbols.makeShortId(id) + '</code> ';
    result += '<span class="symbol-text">' + item.text + '</span>';

    return result;
  }

  function matchMultiple(term, text, item)
  {
    var matches = term.match(/^(?:\s*([0-9]+)\s*x\s*)?(.*?)$/);

    if (matches[1] !== undefined)
    {
      term = matches[2];
      multiplier = parseInt(matches[1], 10);
    }
    else
    {
      multiplier = 1;
    }

    return (item.id && item.id.indexOf(term.toUpperCase()) >= 0) || $.fn.select2.defaults.matcher(term, text, item);
  }

  function consolidateSymbols($input)
  {
    var map = {};

    $input.select2('data').forEach(function(item)
    {
      if (map[item.symbol])
      {
        map[item.symbol].multiplier += item.multiplier;
      }
      else
      {
        map[item.symbol] = item;
      }
    });

    setMultiplier = false;
    $input.select2('data', _.values(map));
    setMultiplier = true;
  }

  return function setUpSymbolSelect2($input, options)
  {
    var multiple = options && options.multiple;
    var originalValue = $input.val();

    if (multiple)
    {
      $input.val('');
    }

    $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: -1,
      placeholder: ' ',
      formatResult: formatResult,
      formatSelection: formatSelection,
      data: multiple
        ? symbols.serializeToMultipleSelect2.bind(symbols)
        : symbols.serializeToSingleSelect2.bind(symbols),
      matcher: multiple ? matchMultiple : $.fn.select2.defaults.matcher
    }, options));

    if (multiple)
    {
      $input.on('change', function(e)
      {
        multiplier = 1;

        if (e.added && setMultiplier)
        {
          consolidateSymbols($input);
        }
      });
    }

    if (multiple && originalValue.length)
    {
      var consolidated = {};

      originalValue.split(' ').forEach(function(symbol)
      {
        if (consolidated[symbol])
        {
          consolidated[symbol].multiplier += 1;
        }
        else
        {
          var symbolModel = symbols.get(symbol);

          consolidated[symbol] = {
            id: '$0$' + symbol,
            text: symbolModel ? symbolModel.get('name') : symbol,
            symbol: symbol,
            multiplier: 1
          };
        }
      });

      setMultiplier = false;
      $input.select2('data', _.values(consolidated));
      setMultiplier = true;
    }

    return $input;
  };
});
