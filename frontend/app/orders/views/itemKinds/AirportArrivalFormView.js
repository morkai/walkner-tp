// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/data/airports',
  './ItemKindFormView',
  'app/orders/templates/itemKinds/airportArrivalForm'
], function(
  airports,
  ItemKindFormView,
  template
) {
  'use strict';

  return ItemKindFormView.extend({

    template: template,

    events: _.extend({}, ItemKindFormView.prototype.events, {

      'change #-passengers': function(e)
      {
        var data = _.defaults({passengers: e.target.value.trim()}, this.model.get('data'));

        this.model.set('data', data, {silent: true});
      },

      'change #-flightNo': function(e)
      {
        var data = _.defaults({flightNo: e.target.value.trim()}, this.model.get('data'));

        this.model.set('data', data, {silent: true});
      },

      'change #-airport': function()
      {
        var airport = this.$id('airport').select2('data').airport;
        var address = airport.toponym + '\n' + airport.name + '\n' + airport.city + '; ' + airport.iata;
        var data = _.defaults({airport: airport.iata}, this.model.get('data'));

        this.model.set('data', data, {silent: true});
        this.model.set('fromAddress', address);
      }

    }),

    afterRender: function()
    {
      ItemKindFormView.prototype.afterRender.call(this);

      this.$id('airport').select2({
        width: '100%',
        data: airports.select2
      });
    }

  });
});
