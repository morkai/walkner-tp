// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/user',
  'app/core/views/ListView'
], function(
  user,
  ListView
) {
  'use strict';

  return ListView.extend({

    columns: ['rid', 'subject', 'owner', 'tel', 'creator', 'createdAt'],

    serializeActions: function()
    {
      var collection = this.collection;

      return function(row)
      {
        var model = collection.get(row._id);
        var actions = [ListView.actions.viewDetails(model)];

        if (model.isEditable())
        {
          actions.push(ListView.actions.edit(model));
        }

        if (model.isDeletable())
        {
          actions.push(ListView.actions.delete(model));
        }

        return actions;
      };
    }

  });
});
