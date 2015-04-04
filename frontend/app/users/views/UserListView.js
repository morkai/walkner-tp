// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/core/views/ListView'
], function(
  ListView
) {
  'use strict';

  return ListView.extend({

    className: 'is-clickable',

    columns: [
      {id: 'login', className: 'is-min'},
      {id: 'lastName', className: 'is-min'},
      {id: 'firstName', className: 'is-min'},
      {id: 'symbol', className: 'is-min'},
      {id: 'email', className: 'is-min'},
      'tel'
    ]

  });
});
