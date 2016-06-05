// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/i18n',
  'app/user',
  'app/core/util/pageActions',
  'app/core/pages/DetailsPage',
  '../views/UserDetailsView'
], function(
  t,
  user,
  pageActions,
  DetailsPage,
  UserDetailsView
) {
  'use strict';

  return DetailsPage.extend({

    DetailsView: UserDetailsView,

    breadcrumbs: function()
    {
      if (user.isAllowedTo('USERS:VIEW'))
      {
        return DetailsPage.prototype.breadcrumbs.call(this);
      }

      return [
        t.bound('users', 'BREADCRUMBS:account')
      ];
    },

    actions: function ()
    {
      var model = this.model;
      var canManage = user.isAllowedTo('USERS:MANAGE');
      var accountMode = !canManage && user.data._id === model.id;

      return [
        {
          label: t.bound('users', accountMode ? 'PAGE_ACTION:editAccount' : 'PAGE_ACTION:edit'),
          icon: 'edit',
          href: model.genClientUrl('edit'),
          privileges: function () { return canManage || accountMode; }
        },
        pageActions.delete(model, 'USERS:MANAGE')
      ];
    }

  });
});
