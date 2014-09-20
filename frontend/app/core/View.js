// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([
  'underscore',
  'jquery',
  'backbone.layout',
  'app/broker',
  'app/socket',
  'app/pubsub',
  './util'
],
function(
  _,
  $,
  Layout,
  broker,
  socket,
  pubsub,
  util
) {
  'use strict';

  function View(options)
  {
    this.idPrefix = _.uniqueId('v');

    this.options = options || {};

    this.timers = {};

    this.promises = [];

    util.defineSandboxedProperty(this, 'broker', broker);
    util.defineSandboxedProperty(this, 'pubsub', pubsub);
    util.defineSandboxedProperty(this, 'socket', socket);

    Layout.call(this, options);

    util.subscribeTopics(this, 'broker', this.localTopics, true);
    util.subscribeTopics(this, 'pubsub', this.remoteTopics, true);
  }

  util.inherits(View, Layout);

  View.prototype.delegateEvents = function(events)
  {
    if (!events)
    {
      events = _.result(this, 'events');
    }

    if (!events)
    {
      return this;
    }

    this.undelegateEvents();

    Object.keys(events).forEach(function(key)
    {
      var method = events[key];

      if (!_.isFunction(method))
      {
        method = this[method];
      }

      if (!_.isFunction(method))
      {
        return;
      }

      var match = key.match(/^(\S+)\s*(.*)$/);
      var eventName = match[1] + '.delegateEvents' + this.cid;
      var selector = match[2];

      if (selector === '')
      {
        this.$el.on(eventName, method.bind(this));
      }
      else
      {
        if (_.isString(this.idPrefix))
        {
          selector = selector.replace(/#-/g, '#' + this.idPrefix + '-');
        }

        this.$el.on(eventName, selector, method.bind(this));
      }
    }, this);
  };

  View.prototype.cleanup = function()
  {
    if (_.isFunction(this.destroy))
    {
      this.destroy();
    }

    util.cleanupSandboxedProperties(this);

    if (_.isObject(this.timers))
    {
      _.each(this.timers, clearTimeout);

      this.timers = null;
    }

    this.cancelRequests();
  };

  View.prototype.serialize = function()
  {
    return {idPrefix: this.idPrefix};
  };

  View.prototype.isRendered = function()
  {
    return this.hasRendered === true;
  };

  View.prototype.isDetached = function()
  {
    return !$.contains(document.documentElement, this.el);
  };

  View.prototype.ajax = function(options)
  {
    return this.promised($.ajax(options));
  };

  View.prototype.promised = function(promise)
  {
    if (!promise || !_.isFunction(promise.abort))
    {
      return promise;
    }

    this.promises.push(promise);

    var view = this;

    promise.always(function()
    {
      if (Array.isArray(view.promises))
      {
        view.promises.splice(view.promises.indexOf(promise), 1);
      }
    });

    return promise;
  };

  View.prototype.cancelRequests = function()
  {
    this.promises.forEach(function(promise) { promise.abort(); });

    this.promises = [];
  };

  View.prototype.cancelAnimations = function(clearQueue, jumpToEnd)
  {
    this.$(':animated').stop(clearQueue !== false, jumpToEnd !== false);
  };

  View.prototype.$id = function(idSuffix)
  {
    var id = '#';

    if (_.isString(this.idPrefix))
    {
      id += this.idPrefix + '-';
    }

    return this.$(id + idSuffix);
  };

  return View;
});
