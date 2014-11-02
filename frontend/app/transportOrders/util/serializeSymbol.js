// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/data/symbols'
], function(
  t,
  symbols
) {
  'use strict';

  return function serializeSymbol(symbol, defaultValue, text)
  {
    if (symbol === null)
    {
      return t('transportOrders', 'symbol:self');
    }

    if (!Array.isArray(symbol))
    {
      var model = symbols.get(symbol);

      if (model)
      {
        return text ? model.getLabel() : model.getShortId();
      }

      return defaultValue === undefined ? '-' : defaultValue;
    }

    var l = symbol.length;

    if (l === 0)
    {
      return defaultValue === undefined ? '-' : defaultValue;
    }

    var symbolToCount = {};

    for (var i = 0; i < l; ++i)
    {
      var s = symbol[i];

      if (symbolToCount[s] === undefined)
      {
        symbolToCount[s] = 0;
      }

      symbolToCount[s] += 1;
    }

    var result = [];

    Object.keys(symbolToCount).forEach(function(s)
    {
      var count = symbolToCount[s];
      var model = symbols.get(s);

      if (model)
      {
        s = text ? model.getLabel() : model.getShortId();
      }

      result.push((count > 1 ? (count + 'x') : '') + s);
    });

    return result.join(text ? '<br>' : ', ');
  };
});
