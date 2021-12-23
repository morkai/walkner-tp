// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'jquery',
  'app/viewport',
  '../View',
  'app/core/templates/barcodeScanner',
  'css!app/core/assets/barcodeScanner'
], function(
  $,
  viewport,
  View,
  template
) {
  'use strict';

  return View.extend({

    dialogClassName: 'barcodeScanner-modal',

    template: template,

    events: {

      'click': function()
      {
        viewport.closeDialog();
      }
    },

    destroy: function()
    {
      if (this.scanner)
      {
        this.scanner.stop();
        this.scanner = null;
      }
    },

    onDialogShown: function()
    {
      this.loadDependencies();
    },

    loadDependencies: function()
    {
      if (window.Html5Qrcode)
      {
        this.onDependencyLoadSuccess();

        return;
      }

      var script = document.createElement('script');

      script.setAttribute('type', 'text/javascript');

      document.body.appendChild(script);

      script.onload = this.onDependencyLoadSuccess.bind(this);
      script.onerror = this.onDependencyLoadFailure.bind(this);
      script.src = '/vendor/html5-qrcode.min.js';
    },

    onDependencyLoadSuccess: function()
    {
      this.scanner = new window.Html5Qrcode(this.idPrefix + '-scanner', {
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: false,
          formatsToSupport: this.options.formatsToSupport || [
            window.Html5QrcodeSupportedFormats.QR_CODE
          ]
        }
      });

      var cameraConfig = Object.assign({
        facingMode: 'environment'
      }, this.options.cameraConfig);

      var scanConfig = Object.assign({
        fps: 10,
        qrbox: {width: 250, height: 250},
        aspectRatio: 1
      }, this.options.scanConfig);

      this.scanner.start(cameraConfig, scanConfig, this.onScanSuccess.bind(this));
    },

    onDependencyLoadFailure: function(err)
    {
      this.$id('scanner').html('<p class="barcodeScanner-error"></p>').text(err && err.message || '?');
    },

    onScanSuccess: function(decodedText, result)
    {
      this.trigger('success', decodedText, result);
    }

  });
});
