// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/symbols/SymbolCollection',
  './createStorage'
], function(
  SymbolCollection,
  createStorage
) {
  'use strict';

  return createStorage('SYMBOLS', 'symbols', SymbolCollection);
});
