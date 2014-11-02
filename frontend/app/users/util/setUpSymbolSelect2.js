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

  function format(item)
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
    }

    return '<code>' + id.replace(/^PL02/, '') + '</code> <span>' + item.text + '</span>';
  }

  function matchMultiple(term, text, item)
  {
    return (item.id && item.id.indexOf(term.toUpperCase()) >= 0) || $.fn.select2.defaults.matcher(term, text, item);
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
      formatResult: format,
      formatSelection: format,
      data: multiple ? symbols.createSelect2Generator() : symbols.select2,
      matcher: multiple ? matchMultiple : $.fn.select2.defaults.matcher
    }, options));

    if (multiple && originalValue.length)
    {
      $input.select2('data', originalValue.split(' ').map(function(id, i)
      {
        var text = symbols.map[id];

        return {
          id: '$' + i + '$' + id,
          text: text || id
        };
      }));
    }

    return $input;
  };
});
