// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([

], function(

) {
  'use strict';

  var STORAGE_KEY = 'TRANSPORT_KINDS';
  var privileges = window[STORAGE_KEY] || [];

  delete window[STORAGE_KEY];

  return privileges;
});
