// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/pages/AddFormPage',
  '../views/TransportOrderFormView'
], function(
  AddFormPage,
  TransportOrderFormView
) {
  'use strict';

  return AddFormPage.extend({

    FormView: TransportOrderFormView

  });
});
