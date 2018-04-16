// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

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
      if (res.responseJSON.error.code === 11000)
      {
        this.$id('_id').select();

        return this.showErrorMessage(t('symbols', 'FORM:ERROR:duplicateId'));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
