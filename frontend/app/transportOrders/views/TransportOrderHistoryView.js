// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/time',
  'app/data/airports',
  'app/core/views/DetailsView',
  'app/transportOrders/templates/history',
  '../util/preparePrice'
], function(
  t,
  time,
  airports,
  DetailsView,
  detailsTemplate,
  preparePrice
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    remoteTopics: {},

    serialize: function()
    {
      var model = this.model;

      return {
        idPrefix: this.idPrefix,
        changed: model.get('changedProperties'),
        notes: model.get('notes')
      };
    },

    serializeUserName: function(user)
    {
      if (!user)
      {
        return '-';
      }

      if (user.label)
      {
        return user.label;
      }

      if (user.firstName || user.lastName)
      {
        return user.firstName + ' ' + user.lastName;
      }

      return user.login || user._id;
    }

  });
});
