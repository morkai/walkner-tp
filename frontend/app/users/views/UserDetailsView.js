// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/data/loadedModules',
  'app/core/views/DetailsView',
  'app/users/templates/details'
], function(
  loadedModules,
  DetailsView,
  detailsTemplate
) {
  'use strict';

  return DetailsView.extend({

    template: detailsTemplate,

    getTemplateData: function()
    {
      return {
        loadedModules: loadedModules
      };
    }

  });
});
