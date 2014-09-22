// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([

], function(

) {
  'use strict';

  var decimalPoint = (1.2).toLocaleString().substr(1, 1);

  return function preparePrice(value)
  {
    if (typeof value === 'number')
    {
      value = value.toLocaleString();
    }

    var parts = value.split(decimalPoint);
    var integer = parts[0].replace(/[^0-9]+/g, '');
    var decimals = parts[1] ? parts[1].replace(/[^0-9]+/g, '') : '';

    if (integer === '')
    {
      integer = '0';
    }

    if (decimals === '')
    {
      decimals = '00';
    }
    else if (decimals.length > 2)
    {
      decimals = decimals.substr(0, 2);
    }
    else if (decimals.length === 1)
    {
      decimals += '0';
    }

    return {
      str: parseInt(integer, 10).toLocaleString() + decimalPoint + decimals,
      num: parseFloat(integer + '.' + decimals),
      zero: integer === '0' && decimals === '00'
    };
  };
});
