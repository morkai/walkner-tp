// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n'
], function(
  t
) {
  'use strict';

  return function serializeSymbol(symbol, defaultValue)
  {
    if (symbol === null)
    {
      return t('transportOrders', 'symbol:self');
    }

    if (!Array.isArray(symbol))
    {
      return symbol || (defaultValue === undefined ? '-' : defaultValue);
    }

    var l = symbol.length;

    if (l === 0)
    {
      return defaultValue === undefined ? '-' : defaultValue;
    }

    var symbols = {};

    for (var i = 0; i < l; ++i)
    {
      var s = symbol[i];

      if (symbols[s] === undefined)
      {
        symbols[s] = 0;
      }

      symbols[s] += 1;
    }

    var result = [];

    Object.keys(symbols).forEach(function(s)
    {
      var count = symbols[s];

      result.push((count > 1 ? (count + 'x') : '') + s.replace('PL02', ''));
    });

    return result.join(', ');
  };
});
