<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

?>
<fieldset class="panel panel-primary">
  <div class="panel-heading">
    <? if (empty($editing)): ?>
    Formularz dodawania zamówienia
    <? else: ?>
    Formularz edycji zamówienia
    <? endif ?>
  </div>
  <div class="panel-body with-form">
    <div class="form-group">
      <?= label('order-summary', 'Krótki opis') ?>
      <input id=order-summary name=order[summary] class="form-control" type=text value="<?= $order->summary ?>" autofocus placeholder="Czego dotyczy dane zamówienie...">
    </div>
    <div class="form-group has-required-select2">
      <?= label('order-owner', 'Inicjator', true) ?>
      <input id=order-owner name=order[owner] class="form-control" type=text value="<?= $order->owner ?>" required>
    </div>
    <label id="focusLastItem">Pozycje</label>
    <table class="table table-bordered table-condensed table-striped">
      <thead>
        <tr>
          <th>Lp.</th>
          <th>Rodzaj usługi <span class="required">*</span></th>
          <th>Data i czas usługi <span class="required">*</span></th>
          <th>Pasażerowie</th>
          <th class="passengers">Ilość osób <span class="required">*</span></th>
          <th>Skąd przyjazd-wyjazd <span class="required">*</span></th>
          <th>Dokąd przejazd <span class="required">*</span></th>
          <th>Symbol MPK</th>
          <th class="actions">Akcje</th>
        </tr>
      </thead>
      <tbody id="order-items">
        <? foreach ($order->items as $itemIndex => $item): ?>
        <tr class="order-item" data-time="<?= $item->time ?>">
          <td class="no"><?= $itemIndex + 1 ?>.</td>
          <td class="what"><textarea name="order[items][what][]" class="form-control" maxlength="100" placeholder="Czego dotyczy dana pozycja..." required><?= e($item->what) ?></textarea></td>
          <td class="whenTo"><input name="order[items][whenTo][]" class="form-control" type="datetime-local" value="<?= e($item->whenTo) ?>" required min="<?= date('Y-m-d H:i:s') ?>" title="0000-00-00 00:00" placeholder="rrrr-mm-dd --:--" pattern="^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$"></td>
          <td class="who"><textarea name="order[items][who][]" class="form-control" rows="3" maxlength="4000" placeholder="Dane każdego pasażera w oddzielnej linii..."><?= e($item->who) ?></textarea></td>
          <td class="passengers"><input name="order[items][passengers][]" class="form-control" type="number" value="<?= $item->passengers ?>" required min="1" max="100"></td>
          <td class="from"><textarea name="order[items][from][]" class="form-control" rows="3" maxlength="500" required placeholder="Adres pasażerów..."><?= e($item->from) ?></textarea></td>
          <td class="to"><textarea name="order[items][to][]" class="form-control" rows="3" maxlength="500" required placeholder="Adres docelowy transportu pasażerów..."><?= e($item->to) ?></textarea></td>
          <td class="symbol"><input name="order[items][symbol][]" class="form-control" type="text" value="<?= e($item->symbol) ?>" maxlength="30"></td>
          <td class="actions"><button class="btn btn-default order-item-action" type="button"><i class="fa fa-<?= $itemIndex + 1 === count($order->items) ? 'plus' : 'times' ?>"></i></button></td>
        </tr>
        <? endforeach ?>
      </tbody>
    </table>
  </div>
  <div class="panel-footer">
    <input class="btn btn-lg btn-primary" type="submit" value="Zapisz" <?= $editing ? 'disabled' : '' ?>>
  </div>
</fieldset>

<? begin_slot('head') ?>
<style>
.table-condensed > tbody > tr > td {
  padding: 0;
}
.table-bordered > thead > tr > th {
  border-bottom-width: 0;
  cursor: default;
}
td.actions {
  text-align: center;
}
.order-item > .no {
  width: 1%;
  text-align: right;
  padding: 5px;
  cursor: default;
}
th.passengers {
  white-space: nowrap;
  width: 1%;
}
.order-item > .passengers > .form-control {
  text-align: right;
}
.order-item > .whenTo {
  width: 1%;
}
.order-item > .whenTo > .form-control {
  width: 210px;
}
.order-item .form-control {
  height: 74px;
  border: 0;
  background: transparent;
  box-shadow: none;
}
.order-item .form-control:focus {
  background-color: #FFFFD6;
}
.order-item textarea.form-control {
  resize: none;
}
input[type="number"] {
  -moz-appearance: textfield;
}
td.symbol {
  width: 100px;
}
</style>
<? append_slot() ?>

<? begin_slot('js') ?>
<script src="<?= url_for('/__vendor__/select2/select2.min.js') ?>"></script>
<script src="<?= url_for('/__vendor__/select2/select2_locale_pl.js') ?>"></script>
<script>
$(function()
{
  var owner = null;
  <? if ($order->owner): ?>
  owner = {id: <?= $order->owner ?>, text: <?= json_encode($order->ownerName) ?>};
  <? endif ?>
  var lastEnterTarget = null;
  var clearLastEnterTargetTimer = null;
  var $orderItems = $('#order-items');

  $('body').on('keydown', function(e)
  {
    if (e.keyCode === 13)
    {
      lastEnterTarget = e.target;

      clearTimeout(clearLastEnterTargetTimer);
      clearLastEnterTargetTimer = setTimeout(function()
      {
        lastEnterTarget = null;
        clearLastEnterTargetTimer = null;
      }, 250);
    }
  });

  $('.btn-primary').on('click', function(e)
  {
    if (lastEnterTarget)
    {
      return false;
    }
  });

  $('#focusLastItem').click(function()
  {
    $('.order-item:last-child').find('.form-control').first().focus();
  });

  $orderItems.on('click', '.order-item-action', function(e)
  {
    var $action = $(e.currentTarget);

    if ($action.find('.fa').hasClass('fa-plus'))
    {
      createOrderItem($action);
    }
    else
    {
      removeOrderItem($action.closest('.order-item'));
    }
  });

  $orderItems.on('keydown', function(e)
  {
    if (!e.ctrlKey)
    {
      return;
    }

    if (e.keyCode === 38)
    {
      moveUp(e.target);

      return false;
    }

    if (e.keyCode === 40)
    {
      moveDown(e.target);

      return false;
    }

    if (e.keyCode === 37)
    {
      moveLeft(e.target);

      return false;
    }

    if (e.keyCode === 39)
    {
      moveRight(e.target);

      return false;
    }
  });

  $orderItems.on('keydown', '.what > .form-control', function(e)
  {
    if (e.keyCode === 13)
    {
      return false;
    }
  });

  $orderItems.on('blur', '.who > .form-control', function()
  {
    var who = this.value
      .split(/\r\n|\r|\n/)
      .map(function(line) { return line.trim(); })
      .filter(function(line) { return line.length > 0; });

    this.value = who.join('\r\n');
    this.parentNode.nextElementSibling.children[0].value = Math.max(who.length, 1);
  });

  $orderItems.on('blur', '.whenTo > .form-control', function()
  {
    var matches = this.value.match(/([0-9]{4}).*?([0-9]{2}).*?([0-9]{2})(?:.*?([0-9]{2}).*?([0-9]{2}))?/);

    var time = matches === null
      ? NaN
      : Date.parse(matches[1] + '-' + matches[2] + '-' + matches[3] + 'T' + (matches[4] || '00') + ':' + (matches[5] || '00') + ':00');

    this.parentNode.parentNode.dataset.time = isNaN(time) ? 0 : time;

    if (this.type !== 'datetime-local')
    {
      this.value = isNaN(time)
        ? ''
        : (matches[1] + '-' + matches[2] + '-' + matches[3] + ' ' + (matches[4] || '00') + ':' + (matches[5] || '00'));
    }

    setTimeout(sortOrderItems, 1);
  });

  $('thead').on('click', 'th', function(e)
  {
    $($orderItems[0].lastElementChild.children[$(e.currentTarget).index()]).find('.form-control, .btn').focus();
  });

  $('#order-owner').removeClass('form-control').select2({
    placeholder: 'Szukaj po imieniu i nazwisku...',
    minimumInputLength: 3,
    ajax: {
      url: '<?= url_for('/users') ?>',
      data: function(term, page)
      {
        return {
          query: term,
          page: page
        };
      },
      results: function(users)
      {
        return {
          results: users.map(function(user)
          {
            return {
              id: user.id,
              text: user.name
            };
          })
        };
      }
    }
  }).select2('data', owner);

  $orderItems.find('input[type="datetime-local"]').each(function()
  {
    if (this.type === 'datetime-local')
    {
      this.value = this.getAttribute('value').replace(' ', 'T');
    }
  });

  function createOrderItem($action)
  {
    var $prevOrderItem = $action.closest('.order-item');
    var $newOrderItem = $prevOrderItem.clone();
    var $controls = $newOrderItem.find('.form-control');

    $controls
      .val('')
      .filter('[name="order[items][symbol][]"]')
      .val($prevOrderItem.find('.form-control[name="order[items][symbol][]"]').val());

    $action.find('.fa').removeClass('fa-plus').addClass('fa-times');
    $newOrderItem.insertAfter($prevOrderItem);
    $newOrderItem.find('.form-control').first().focus();

    recountOrderItemNo();
  }

  function removeOrderItem($orderItem)
  {
    var $siblingOrderItem = $orderItem.next() || $orderItem.prev();

    $orderItem.remove();
    $siblingOrderItem.find('.form-control').first().focus();
    recountOrderItemNo();
  }

  function recountOrderItemNo()
  {
    $orderItems.find('td.no').each(function(i)
    {
      this.innerHTML = i + 1 + '.';
    });
  }

  function sortOrderItems()
  {
    var oldOrderItems = $.makeArray($orderItems.children());
    var newOrderItems = [].concat(oldOrderItems);

    newOrderItems.sort(function(a, b)
    {
      if (a.dataset.time === '0' || b.dataset.time === '0')
      {
        return 0;
      }

      return a.dataset.time - b.dataset.time;
    });

    var orderChanged = false;

    for (var i = 0, l = oldOrderItems.length; i < l; ++i)
    {
      if (newOrderItems[i] !== oldOrderItems[i])
      {
        orderChanged = true;
        break;
      }
    }

    if (!orderChanged)
    {
      return;
    }

    var $focusedElement = $(':focus');

    $orderItems.children().detach();
    $orderItems.append(newOrderItems);

    recountOrderItemNo();

    $focusedElement.focus();
  }

  function moveUp(el)
  {
    var orderItemEl = $(el).closest('.order-item')[0];

    focusControl(
      orderItemEl.previousElementSibling || orderItemEl.parentNode.lastElementChild,
      el.name
    );
  }

  function moveDown(el)
  {
    var orderItemEl = $(el).closest('.order-item')[0];

    focusControl(
      orderItemEl.nextElementSibling || orderItemEl.parentNode.firstElementChild,
      el.name
    );
  }

  function moveLeft(el)
  {
    if (el.parentNode.previousElementSibling.children.length)
    {
      el.parentNode.previousElementSibling.children[0].focus();
    }
    else
    {
      el.parentNode.parentNode.lastElementChild.children[0].focus();
    }
  }

  function moveRight(el)
  {
    if (el.parentNode.nextElementSibling)
    {
      el.parentNode.nextElementSibling.children[0].focus();
    }
    else
    {
      el.parentNode.parentNode.querySelector('.form-control').focus();
    }
  }

  function focusControl(orderItemEl, controlName)
  {
    var selector = controlName === ''
      ? '.btn'
      : '.form-control[name="' + controlName + '"]';

    orderItemEl.querySelector(selector).focus();
  }
});
</script>
<? append_slot() ?>
