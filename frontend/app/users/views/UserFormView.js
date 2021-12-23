// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'jquery',
  'app/ZeroClipboard',
  'app/i18n',
  'app/user',
  'app/viewport',
  'app/core/Model',
  'app/core/views/FormView',
  'app/core/util/idAndLabel',
  'app/data/privileges',
  'app/data/loadedModules',
  'app/symbols/util/setUpSymbolSelect2',
  '../User',
  'app/users/templates/formMobileList',
  'app/users/templates/form'
], function(
  _,
  $,
  ZeroClipboard,
  t,
  user,
  viewport,
  Model,
  FormView,
  idAndLabel,
  privileges,
  loadedModules,
  setUpSymbolSelect2,
  User,
  formMobileListTemplate,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    events: {
      'submit': 'submitForm',
      'input input[type="password"]': function(e)
      {
        if (this.timers.validatePasswords !== null)
        {
          clearTimeout(this.timers.validatePasswords);
        }

        this.timers.validatePasswords = setTimeout(this.validatePasswords.bind(this, e), 30);
      },
      'keydown #-mobile': function(e)
      {
        if (e.keyCode === 13)
        {
          this.$id('mobile-add').click();

          return false;
        }
      },
      'click #-mobile-add': function()
      {
        var $number = this.$id('mobile-number');
        var $from = this.$id('mobile-from');
        var $to = this.$id('mobile-to');

        this.addMobile($number.val(), $from.val(), $to.val());
        this.renderMobileList();

        $number.val('').focus();
        $from.val('');
        $to.val('');
      },
      'click .users-form-mobile-remove': function(e)
      {
        this.removeMobile(this.$(e.target).closest('li').attr('data-number'));
        this.$id('mobile-number').select();

        return false;
      }
    },

    initialize: function()
    {
      FormView.prototype.initialize.call(this);

      this.mobileList = null;

      this.accountMode = this.options.editMode
        && user.data._id === this.model.id
        && !user.isAllowedTo('USERS:MANAGE');

      $(window).on('resize.' + this.idPrefix, _.debounce(this.resizeColumns.bind(this), 16));
    },

    destroy: function()
    {
      $(window).off('.' + this.idPrefix);
      $(document).off('.' + this.idPrefix);

      if (this.privilegesCopyClient)
      {
        this.privilegesCopyClient.destroy();
        this.privilegesCopyClient = null;
      }
    },

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      if (!this.accountMode)
      {
        this.setUpPrivilegesControls();
      }

      setUpSymbolSelect2(this.$id('symbol'));

      if (!this.mobileList)
      {
        this.mobileList = this.model.get('mobile') || [];
      }

      this.renderMobileList();

      this.resizeColumns();
    },

    setUpPrivilegesControls: function()
    {
      var privilegeMap = {};
      var privilegeList = [];

      privileges.forEach(function(privilege)
      {
        var tag = t('users', 'PRIVILEGE:' + privilege);

        privilegeMap[tag] = privilege;
        privilegeList.push({
          id: privilege,
          text: tag
        });
      });

      this.$id('privileges').select2({
        width: '100%',
        allowClear: false,
        tags: privilegeList,
        tokenSeparators: [';'],
        createSearchChoice: function(term)
        {
          var tag = term.trim();
          var privilege = privilegeMap[tag];

          return !privilege ? null : {
            id: privilege,
            text: tag
          };
        }
      });

      this.setUpPrivilegesCopy();
    },

    serializePrivileges: function()
    {
      var selectedOptions = this.$id('privileges').select2('data');

      if (selectedOptions.length === 0)
      {
        return '';
      }

      return selectedOptions.map(function(data) { return data.text; }).join(';') + ';';
    },

    setUpPrivilegesCopy: function()
    {
      var view = this;
      var $btn = view.$id('copyPrivileges');
      var client = view.privilegesCopyClient = new ZeroClipboard($btn);

      client.on('copy', function(e)
      {
        e.clipboardData.setData('text/plain', view.serializePrivileges());
      });

      client.on('aftercopy', function()
      {
        viewport.msg.show({
          type: 'info',
          time: 2000,
          text: t('users', 'FORM:copyPrivileges:success')
        });
      });

      client.on('error', function(err)
      {
        console.error(err);

        ZeroClipboard.destroy();

        $(document).on('copy.' + view.idPrefix, view.onCopy.bind(view));

        $btn.on('mousedown', function()
        {
          view.captureCopy = true;

          document.execCommand('copy');
        });
      });
    },

    onCopy: function(e)
    {
      if (!this.captureCopy)
      {
        return;
      }

      this.captureCopy = false;

      e.preventDefault();

      e.originalEvent.clipboardData.setData('text/plain', this.serializePrivileges());

      viewport.msg.show({
        type: 'info',
        time: 2000,
        text: t('users', 'FORM:copyPrivileges:success')
      });
    },

    validatePasswords: function()
    {
      var $password1 = this.$id('password');
      var $password2 = this.$id('password2');

      if ($password1.val() === $password2.val())
      {
        $password2[0].setCustomValidity('');
      }
      else
      {
        $password2[0].setCustomValidity(t('users', 'FORM:ERROR:passwordMismatch'));
      }

      this.timers.validatePassword = null;
    },

    getTemplateData: function()
    {
      return {
        privileges: privileges,
        accountMode: this.accountMode,
        notifications: User.NOTIFICATIONS
      };
    },

    serializeToForm: function()
    {
      var formData = this.model.toJSON();

      formData.active = (!!formData.active).toString();
      formData.privileges = (formData.privileges || []).join(',');

      return formData;
    },

    serializeForm: function(formData)
    {
      formData = _.defaults(formData, {
        privileges: [],
        aors: [],
        mrps: [],
        preferences: {}
      });

      ['firstName', 'lastName', 'email'].forEach(function(prop)
      {
        if (!formData[prop] || !formData[prop].length)
        {
          formData[prop] = '';
        }
      });

      ['privileges'].forEach(function(prop)
      {
        if (typeof formData[prop] === 'string')
        {
          formData[prop] = formData[prop].split(',');
        }
      });

      if (!formData.symbol)
      {
        formData.symbol = null;
      }

      formData.mobile = this.serializeMobile();

      return formData;
    },

    serializeMobile: function()
    {
      var mobileMap = {};

      _.forEach(this.mobileList, function(mobile)
      {
        mobileMap[mobile.number] = mobile;
      });

      return _.values(mobileMap);
    },

    resizeColumns: function()
    {
      var $columns = this.$('.col-lg-3');

      if (!$columns.length)
      {
        return;
      }

      var $maxColumn = null;
      var maxHeight = 0;

      $columns.each(function()
      {
        var $column = $(this).css('height', '');
        var columnHeight = $column.outerHeight();

        if (columnHeight > maxHeight)
        {
          $maxColumn = $column;
          maxHeight = columnHeight;
        }
      });

      if (window.innerWidth >= 1200)
      {
        $columns.each(function()
        {
          this.style.height = this === $maxColumn[0] ? '' : (maxHeight + 'px');
        });
      }
    },

    renderMobileList: function()
    {
      this.$id('mobile-list').html(this.renderPartialHtml(formMobileListTemplate, {
        mobileList: this.mobileList
      }));
    },

    removeMobile: function(number)
    {
      this.mobileList = this.mobileList.filter(function(mobile) { return mobile.number !== number; });

      this.renderMobileList();
    },

    addMobile: function(number, fromTime, toTime)
    {
      number = this.parseMobileNumber(number);
      fromTime = this.parseMobileTime(fromTime);
      toTime = this.parseMobileTime(toTime);

      if (number && fromTime && toTime)
      {
        this.mobileList.push({
          number: number,
          fromTime: fromTime,
          toTime: toTime
        });
      }
    },

    parseMobileNumber: function(number)
    {
      number = number.replace(/[^0-9]/g, '');

      if (number.length < 9)
      {
        return '';
      }

      if (number.length === 9)
      {
        number = '48' + number;
      }

      if (number.length > 11)
      {
        return '';
      }

      return '+' + number;
    },

    parseMobileTime: function(time)
    {
      if (!time.trim().length)
      {
        time = '00:00';
      }

      if (time > -1 && time < 25)
      {
        if (time < 10)
        {
          time = '0' + time + ':00';
        }
        else if (time === '24')
        {
          time = '00:00';
        }
        else
        {
          time += ':00';
        }
      }

      var matches = time.match(/([0-9]{1,2})[^0-9]*([0-9]{2})/);

      if (matches === null)
      {
        return '00:00';
      }

      if (matches[1].length === 1)
      {
        matches[1] = '0' + matches[1];
      }

      return matches[1] + ':' + matches[2];
    },

    handleFailure: function(jqXhr)
    {
      var json = jqXhr.responseJSON;
      var error = json && json.error && json.error.message;

      if (t.has('users', 'FORM:ERROR:' + error))
      {
        return this.showErrorMessage(t('users', 'FORM:ERROR:' + error));
      }

      return FormView.prototype.handleFailure.apply(this, arguments);
    }

  });
});
