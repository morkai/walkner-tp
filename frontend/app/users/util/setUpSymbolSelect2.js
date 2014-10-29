// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'app/data/symbols'
], function(
  _,
  symbols
) {
  'use strict';

  function format(item)
  {
    if (!item.id)
    {
      return item.text;
    }

    return '<code>' + item.id + '</code> ' + item.text;
  }

  return function setUpSymbolSelect2($input, options)
  {
    $input.select2(_.extend({
      openOnEnter: null,
      allowClear: true,
      minimumInputLength: -1,
      placeholder: ' ',
      formatResult: format,
      formatSelection: format,
      data: symbols.select2
    }, options));

    return $input;
  };
});
