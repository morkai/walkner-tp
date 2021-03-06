// Part of <https://miracle.systems/p/walkner-tp> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'backbone.layout',
  'app/broker',
  'app/socket',
  'app/pubsub',
  'app/i18n',
  './util'
],
function(
  _,
  $,
  Layout,
  broker,
  socket,
  pubsub,
  t,
  util
) {
  'use strict';

  function View(options)
  {
    var view = this;

    view.idPrefix = _.uniqueId('v');

    view.options = options || {};

    view.timers = {};

    view.promises = [];

    _.forEach(view.sections, function(selector, section)
    {
      if (typeof selector !== 'string' || selector === '#')
      {
        view.sections[section] = '#' + view.idPrefix + '-' + section;
      }
      else
      {
        view.sections[section] = selector.replace('#-', '#' + view.idPrefix + '-');
      }
    });

    util.defineSandboxedProperty(view, 'broker', broker);
    util.defineSandboxedProperty(view, 'pubsub', pubsub);
    util.defineSandboxedProperty(view, 'socket', socket);

    Layout.call(view, options);

    util.subscribeTopics(view, 'broker', view.localTopics, true);

    if (view.remoteTopicsAfterSync)
    {
      if (view.remoteTopicsAfterSync === true)
      {
        view.remoteTopicsAfterSync = 'model';
      }

      if (typeof view.remoteTopicsAfterSync === 'string' && view[view.remoteTopicsAfterSync])
      {
        view.listenToOnce(
          view[view.remoteTopicsAfterSync],
          'sync',
          util.subscribeTopics.bind(util, view, 'pubsub', view.remoteTopics, true)
        );
      }
    }
    else
    {
      util.subscribeTopics(view, 'pubsub', view.remoteTopics, true);
    }
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

  View.prototype.getViews = function(fn)
  {
    if (typeof fn === 'string' && /^#-/.test(fn))
    {
      fn = fn.replace('#-', '#' + this.idPrefix + '-');
    }

    return Layout.prototype.getViews.call(this, fn);
  };

  View.prototype.setView = function(name, view, insert, insertOptions)
  {
    if (typeof name === 'string' && /^#-/.test(name))
    {
      name = name.replace('#-', '#' + this.idPrefix + '-');
    }

    return Layout.prototype.setView.call(this, name, view, insert, insertOptions);
  };

  View.prototype.cleanup = function()
  {
    this.destroy();
    this.cleanupSelect2();

    util.cleanupSandboxedProperties(this);

    if (_.isObject(this.timers))
    {
      _.forEach(this.timers, clearTimeout);

      this.timers = {};
    }

    this.cancelRequests();
  };

  View.prototype.destroy = function() {};

  View.prototype.cleanupSelect2 = function()
  {
    var view = this;

    this.$('.select2-container').each(function()
    {
      view.$('#' + this.id.replace('s2id_', '')).select2('destroy');
    });
  };

  View.prototype.beforeRender = function() {};

  View.prototype.serialize = function()
  {
    return _.assign(this.getCommonTemplateData(), this.getTemplateData());
  };

  View.prototype.getCommonTemplateData = function()
  {
    return {
      idPrefix: this.idPrefix,
      helpers: this.getTemplateHelpers()
    };
  };

  View.prototype.getTemplateData = function()
  {
    return {};
  };

  View.prototype.getTemplateHelpers = function()
  {
    return {
      t: this.t.bind(this),
      props: this.props.bind(this)
    };
  };

  View.prototype.renderPartial = function(partial, data)
  {
    return $(this.renderPartialHtml(partial, data));
  };

  View.prototype.renderPartialHtml = function(partial, data)
  {
    return partial(_.assign(this.getCommonTemplateData(), data));
  };

  View.prototype.afterRender = function() {};

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
    this.$el.stop(clearQueue !== false, jumpToEnd !== false);
    this.$(':animated').stop(clearQueue !== false, jumpToEnd !== false);
  };

  View.prototype.$id = function(idSuffix)
  {
    var id = '#';

    if (_.isString(this.idPrefix))
    {
      id += this.idPrefix + '-';
    }

    return $(id + idSuffix);
  };

  View.prototype.getDefaultModel = function()
  {
    return this[this.modelProperty] || this.model || this.collection;
  };

  View.prototype.getDefaultNlsDomain = function()
  {
    var model = this.getDefaultModel();

    return model.getNlsDomain ? model.getNlsDomain() : (model.nlsDomain || 'core');
  };

  View.prototype.t = function(domain, key, data)
  {
    if (data || typeof key === 'string')
    {
      return t(domain, key, data);
    }

    var defaultDomain = this.getDefaultNlsDomain();

    if (typeof key === 'object')
    {
      return t(defaultDomain, domain, key);
    }

    return t(defaultDomain, domain);
  };

  View.prototype.props = function(data, options)
  {
    var view = this;

    if (!options)
    {
      options = data;
      data = options.data;
    }

    var html = '<div class="props ' + (options.first ? 'first' : '') + '">';
    var defaultNlsDomain = view.getDefaultNlsDomain();

    [].concat(_.isArray(options) ? options : options.props).forEach(function(prop)
    {
      if (typeof prop === 'string')
      {
        prop = {id: prop};
      }

      var escape = prop.escape === false ? false : (prop.id.charAt(0) !== '!');
      var id = escape ? prop.id : prop.id.substring(1);
      var className = prop.className || '';
      var valueClassName = prop.valueClassName || '';
      var nlsDomain = prop.nlsDomain || options.nlsDomain || defaultNlsDomain;
      var label = prop.label || t(nlsDomain, 'PROPERTY:' + id);
      var value = _.isFunction(prop.value)
        ? prop.value(data[id], prop, view)
        : _.isUndefined(prop.value) ? data[id] : prop.value;

      if (_.isFunction(prop.visible) && !prop.visible(value, prop, view))
      {
        return;
      }

      if (prop.visible != null && !prop.visible)
      {
        return;
      }

      if (escape)
      {
        value = _.escape(value);
      }

      html += '<div class="prop ' + className + '" data-prop="' + id + '">'
        + '<div class="prop-name">' + label + '</div>'
        + '<div class="prop-value ' + valueClassName + '">' + value + '</div>'
        + '</div>';
    });

    return html + '</div>';
  };

  return View;
});
