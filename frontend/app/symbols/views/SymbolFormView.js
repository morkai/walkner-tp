// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'app/i18n',
  'app/core/views/FormView',
  'app/data/symbols',
  'app/symbols/templates/form'
], function(
  t,
  FormView,
  symbols,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (this.options.editMode)
      {
        this.$('.form-control[name=_id]').attr('readonly', true);
      }

      var groups = {};

      symbols.forEach(function(symbol)
      {
        groups[symbol.get('group')] = true;
      });

      this.$id('groupChoice').select2({
        data: Object.keys(groups).map(function(group)
        {
          return {
            id: group,
            text: group
          };
        }),
        placeholder: t('symbols', 'select2:placeholder')
      });

      var view = this;

      this.$id('groupChoice').on('change', function(e)
      {
        if (e.added)
        {
          view.$id('group').val(e.added.text);
        }

        view.$id('groupChoice').select2('data', null);
      });
    },

    handleFailure: function(res)
    {
      if (res.responseJSON.error.code === 'DUPLICATE_KEY')
      {
        this.$id('_id').select();

        return this.showErrorMessage(t('symbols', 'FORM:ERROR:duplicateId'));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
