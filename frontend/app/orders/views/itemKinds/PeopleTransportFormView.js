// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  './ItemKindFormView',
  'app/orders/templates/itemKinds/peopleTransportForm'
], function(
  ItemKindFormView,
  template
) {
  'use strict';

  return ItemKindFormView.extend({

    template: template,

    events: _.extend({}, ItemKindFormView.prototype.events, {

      'change #-passengers': function(e)
      {
        var data = {
          passengers: e.target.value.trim()
        };

        this.model.set('data', data, {silent: true});
      }

    })

  });
});
