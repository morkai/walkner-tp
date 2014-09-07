<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

$MAX_PASSENGERS = 2;

orders_check_access();

$page = empty($_GET['page']) ? 1 : (int)$_GET['page'];
$perPage = empty($_GET['perPage']) ? 10 : (int)$_GET['perPage'];

$pagedOrders = new PagedData($page, $perPage);

$where = '';
$user = user_get_data();
$userIsDriver = user_has_role('driver');

if (user_has_role('user'))
{
  $where .= " AND (orders.owner={$user->id} OR orders.creator={$user->id})";
}
else if ($userIsDriver)
{
  $where .= " AND (orders.id IN(SELECT order_items.`order` FROM order_items WHERE order_items.driver={$user->id}))";
}

$q = <<<SQL
SELECT COUNT(*) AS total
FROM orders
WHERE 1=1 {$where}
SQL;

$totalItems = fetch_one($q)->total;

$q = <<<SQL
SELECT orders.*, owner.name AS ownerName, owner.tel AS ownerTel
FROM orders
INNER JOIN users AS owner ON orders.owner=owner.id
WHERE 1=1 {$where}
ORDER BY orders.whenMin DESC
LIMIT {$pagedOrders->getOffset()},{$perPage}
SQL;

$orders = fetch_all($q);

if (empty($orders))
{
  goto VIEW;
}

$firstNo = $pagedOrders->getOffset() + 1;
$orderMap = array();

foreach ($orders as $orderIndex => $order)
{
  $tel = empty($order->tel) ? $order->ownerTel : $order->tel;

  $order->no = $firstNo + $orderIndex;
  $order->owner = e($order->ownerName . ($tel ? " ({$tel})" : ''));
  $order->items = array();

  $orderMap[$order->id] = $order;
}

$orderIds = join(',', array_map(function($order) { return $order->id; }, $orders));

$q = <<<SQL
SELECT `item`.*, `driver`.`name` AS `driverName`, `driver`.`tel` AS `driverTel`
FROM order_items AS `item`
LEFT JOIN `users` AS `driver` ON `item`.`driver` = `driver`.`id`
WHERE `item`.`order` IN({$orderIds})
ORDER BY `item`.order, `item`.`whenTo`
SQL;

$stmt = exec_stmt($q);

$adminOrDispatcher = user_has_role('admin') || user_has_role('dispatcher');

while ($item = $stmt->fetchObject())
{
  if ($userIsDriver && $item->driver !== $user->id)
  {
    continue;
  }

  $passengers = explode("\n", str_replace("\r", "", $item->who));
  $item->allPassengers = e(join('; ', $passengers));

  if (count($passengers) > $MAX_PASSENGERS)
  {
    $item->firstPassengers = e(join('; ', array_slice($passengers, 0, $MAX_PASSENGERS))) . ' i ';
    $remainingPassengers = count($passengers) - $MAX_PASSENGERS;
    $item->firstPassengers .= $remainingPassengers . ' ' . ($remainingPassengers === 1 ? 'inny' : 'innych');
  }
  else
  {
    $item->firstPassengers = $item->allPassengers;
  }

  $driverEditable = $item->driver == $user->id || $adminOrDispatcher;

  $item->kmEditable = $driverEditable;
  $item->hoursEditable = $driverEditable;
  $item->whenFromEditable = $driverEditable;
  $item->driverEditable = $adminOrDispatcher;

  $item->whenFrom = $item->whenFrom ? str_replace(' ', "\n", preg_replace('/:[0-9]{2}$/', '', $item->whenFrom)) : '';
  $item->whenTo = str_replace(' ', "\n", preg_replace('/:[0-9]{2}$/', '', $item->whenTo));
  $item->driverText = !$item->driver ? '' : "{$item->driverName}\n{$item->driverTel}";
  $item->km = $item->km === '0.000' ? '' : str_replace('.', ',', (float)$item->km);
  $item->hours = empty($item->hours) ? '' : $item->hours;

  $order = $orderMap[$item->order];
  $order->items[] = $item;
}

VIEW:

if (is_ajax())
{
  output_json($orders);
}

$pagedOrders->fill($totalItems, $orders);

$drivers = fetch_all("SELECT id, name AS text, tel FROM users WHERE role='driver' ORDER BY name ASC");

?>

<? decorate('Zamówienia') ?>

<? begin_slot('head') ?>
<style>
.table-bordered > thead > tr > th {
  border-bottom-width: 4px;
}
.table > tbody + tbody {
  border-top-width: 4px;
}
th:first-child {
  width: 1%;
}
tbody > tr:first-child > td {
  background-color: #F5F5F5;
}
.order-header-outer {
  padding: 0!important;
}
.order-header {
  position: relative;
  display: flex;
  align-items: center;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.125);
  min-height: 44px;
}
.order-header-inner {
  padding: 5px;
}
.order-header-inner > em {
  font-weight: bold;
  font-style: normal;
}
.passengers-all {
  display: none;
}
.passengers.all .passengers-first {
  display: none;
}
.passengers.all .passengers-all {
  display: inline;
}
td.is-editable {
  background-color: #ECF3FE!important;
}
td.is-editable:hover {
  cursor: pointer;
  outline: 2px solid #4D90FE;
}
.whenTo {
  width: 140px;
}
.whenFrom {
  width: 150px;
}
.whenFrom.is-editable {
  width: 220px;
}
.whenFrom.is-editing {
  white-space: normal;
}
.km,
.hours {
  width: 100px;
  text-align: right;
}
.km > .form-control,
.hours > .form-control {
  text-align: right;
}
.min {
  width: 1%;
}
</style>
<? append_slot() ?>

<div class="page-header">
  <? if (!user_has_role('driver')): ?>
  <ul class="page-actions">
    <li><a class="btn btn-default" href="<?= url_for('/orders/add.php') ?>"><i class="fa fa-plus"></i> Dodaj zamówienie</a>
  </ul>
  <? endif ?>
  <h1>Zamówienia</h1>
</div>

<table class="table table-bordered table-condensed table-hover">
  <thead>
    <tr>
      <th>Lp.
      <th>Rodzaj usługi
      <th>Data i czas usługi
      <th>Ilość osób
      <th>Pasażerowie
      <th>Adres odbioru
      <th>Adres docelowy
      <th>Symbol MPK
      <th>Data i czas wyjazdu
      <th class="min">Kierowca
      <th>Ilość km
      <th>Ilość godz.
      <th class="actions">Akcje
    </tr>
  </thead>
  <? foreach ($pagedOrders AS $orderIndex => $order): ?>
  <tbody>
    <tr id="order-<?= $order->id ?>" data-id="<?= $order->id ?>">
      <td colspan="12" class="order-header-outer">
        <span class="order-header">
          <span class="order-header-inner">
            <?= $order->no ?>. Zamówienie <code><?= $order->id ?></code>
            <em><?= e($order->summary) ?></em>
            zainicjowane przez
            <em><?= $order->owner ?></em>
          </span>
        </span>
      <td class="actions">
        <a class="btn btn-default disabled" title="Wyświetl szczegóły zamówienia" href="<?= url_for("orders/view.php?id={$order->id}") ?>"><i class="fa fa-file-text-o"></i></a>
        <? if (!$userIsDriver): ?>
        <a class="btn btn-default disabled" title="Edytuj zamówienie" href="<?= url_for("orders/edit.php?id={$order->id}") ?>"><i class="fa fa-edit"></i></a>
        <a class="btn btn-danger" title="Usuń zamówienie" href="<?= url_for("orders/delete.php?id={$order->id}") ?>"><i class="fa fa-times"></i></a>
        <? endif ?>
    </tr>
    <? foreach ($order->items as $itemIndex => $item): ?>
    <tr data-id="<?= $item->id ?>">
      <td><?= $order->no ?>.<?= $itemIndex + 1 ?>.
      <td><?= e($item->what) ?>
      <td class="whenTo pre hard"><?= $item->whenTo ?></td>
      <td class="number"><?= $item->passengers ?></td>
      <td class="passengers">
        <span class="passengers-first"><?= $item->firstPassengers ?></span>
        <span class="passengers-all"><?= $item->allPassengers ?></span>
      <td class="pre"><?= e($item->from) ?>
      <td class="pre"><?= e($item->to) ?>
      <td><?= e($item->symbol) ?>
      <td class="whenFrom pre hard <?= $item->whenFromEditable ? 'is-editable' : '' ?>"><?= $item->whenFrom ?></td>
      <td class="driver pre hard <?= $item->driverEditable ? 'is-editable' : '' ?>" data-driver="<?= $item->driver ?>"><?= $item->driverText ?></td>
      <td class="km <?= $item->kmEditable ? 'is-editable' : '' ?>"><?= $item->km ?>
      <td class="hours <?= $item->hoursEditable ? 'is-editable' : '' ?>"><?= $item->hours ?>
      <td class="actions">

    </tr>
    <? endforeach ?>
  </tbody>
  <? endforeach ?>
</table>

<?= $pagedOrders->render(url_for("orders/?perPage={$perPage}")) ?>

<? begin_slot('js') ?>
<script src="<?= url_for('/__vendor__/select2/select2.min.js') ?>"></script>
<script src="<?= url_for('/__vendor__/select2/select2_locale_pl.js') ?>"></script>
<script>
$(function()
{
  var drivers = <?= json_encode($drivers) ?>;

  var $table = $('.table');
  var mouseDownAt = 0;

  $table.on('click', '.btn-danger', function()
  {
    return confirm('Czy na pewno chcesz bezpowrotnie usunąć wybrane zamówienie?');
  });

  $table.on('mousedown', '.passengers', function()
  {
    mouseDownAt = Date.now();
  });

  $table.on('click', '.passengers', function()
  {
    if (Date.now() - mouseDownAt < 200)
    {
      this.classList.toggle('all');
    }
  });

  $table.on('click', '.whenFrom.is-editable', function(e)
  {
    var $td = $(this);
    var $input = $('<input type="datetime-local" class="form-control" placeholder="rrrr-mm-dd --:--">');
    var oldValue = $td.text().trim();
    var newValue = null;

    $input.on('keydown', function(e)
    {
      if (e.keyCode === 13)
      {
        var matches = this.value.match(/([0-9]{4}).*?([0-9]{2}).*?([0-9]{2})(?:.*?([0-9]{2}).*?([0-9]{2}))?/);

        if (matches)
        {
          newValue = matches[1] + '-' + matches[2] + '-' + matches[3] + ' ' + (matches[4] || '00') + ':' + (matches[5] || '00');
        }

        $input.blur();
      }
      else if (e.keyCode === 27)
      {
        newValue = null;
        $input.blur();
      }
    });

    $input.on('blur', function()
    {
      saveOnBlur('whenFrom', $td, oldValue, newValue, function(val) { return val.replace(' ', '\n'); });
    });

    if (oldValue !== '')
    {
      $input.val($input.prop('type') === 'datetime-local' ? (oldValue.replace(/\s/, 'T') + ':00') : oldValue.replace(/\s/, ' '));
    }

    prepareInputTd($td, $input);
  });

  $table.on('click', '.km.is-editable', function(e)
  {
    var $td = $(this);
    var $input = $('<input type="number" class="form-control" placeholder="0000,000" min="0" max="9999.999" step="0.1">');
    var oldValue = $td.text().trim();
    var newValue = null;

    $input.on('keydown', function(e)
    {
      if (e.keyCode === 13)
      {
        var value = parseFloat(this.value.replace(',', '.'));

        if (!isNaN(value) && value >= 0)
        {
          newValue = parseFloat(value.toFixed(3));
        }

        $input.blur();
      }
      else if (e.keyCode === 27)
      {
        newValue = null;
        $input.blur();
      }
    });

    $input.on('blur', function()
    {
      saveOnBlur('km', $td, oldValue, newValue, function(val)
      {
        return val === 0 ? '' : val.toString().replace('.', ',');
      });
    });

    if (oldValue !== '')
    {
      $input.val(oldValue.replace(',', '.'));
    }

    prepareInputTd($td, $input);
  });

  $table.on('click', '.hours.is-editable', function(e)
  {
    var $td = $(this);
    var $input = $('<input type="number" class="form-control" placeholder="0" min="0" max="65335" step="1">');
    var oldValue = $td.text().trim();
    var newValue = null;

    $input.on('keydown', function(e)
    {
      if (e.keyCode === 13)
      {
        var value = parseInt(this.value.replace(/[^0-9]+/g, ''), 10);

        if (!isNaN(value) && value >= 0)
        {
          newValue = value;
        }

        $input.blur();
      }
      else if (e.keyCode === 27)
      {
        newValue = null;
        $input.blur();
      }
    });

    $input.on('blur', function()
    {
      saveOnBlur('hours', $td, oldValue, newValue, function(val)
      {
        return val === 0 ? '' : val.toString();
      });
    });

    if (oldValue !== '')
    {
      $input.val(oldValue);
    }

    prepareInputTd($td, $input);
  });

  $table.on('click', '.driver.is-editable', function(e)
  {
    var $td = $(this);
    var oldDriverText = $td.text().trim();
    var oldDriverId = parseInt($td.attr('data-driver'), 10) || 0;
    var changed = false;

    $td
      .attr('title', 'Wciśnij ENTER, aby zapisać')
      .removeClass('is-editable')
      .addClass('is-editing')
      .html('');

    var $input = $('<input type="text" name="driver">').val(oldDriverId).appendTo($td).select2({
      width: '200px',
      allowClear: true,
      openOnEnter: false,
      placeholder: 'Wybierz kierowcę...',
      data: drivers
    });

    $input.on('change', function()
    {
      changed = true;

      var newDriver = $input.select2('data') || {id: 0};
      var newDriverId = parseInt(newDriver.id, 10) || 0;

      saveOnBlur('driver', $td, oldDriverText, newDriverId, function(value)
      {
        if (typeof value === 'string')
        {
          return value;
        }

        $td.attr('data-driver', newDriverId);

        if (!newDriverId)
        {
          return '';
        }

        var text = newDriver.text;

        if (newDriver.tel)
        {
          text += '\n' + newDriver.tel;
        }

        return text;
      });
    });

    $input.on('select2-blur', function()
    {
      if (!changed)
      {
        restoreValue($td, oldDriverText);
      }
    });

    $input.select2('open');
  });

  function saveOnBlur(field, $td, oldValue, newValue, formatValue)
  {
    if (newValue === oldValue || newValue === null)
    {
      return restoreValue($td, formatValue(oldValue));
    }

    var req = $.ajax({
      type: 'POST',
      url: '<?= url_for('/orders/updateItem.php') ?>',
      data: {
        id: $td.parent().attr('data-id'),
        field: field,
        value: newValue
      }
    });

    req.then(function() { restoreValue($td, formatValue(newValue)); });

    req.fail(function() { restoreValue($td, formatValue(oldValue)); });
  }

  function prepareInputTd($td, $input)
  {
    $td
      .attr('title', 'Wciśnij ENTER, aby zapisać')
      .removeClass('is-editable')
      .addClass('is-editing')
      .text('')
      .append($input);

    $input.focus();
  }

  function restoreValue($td, value)
  {
    $td
      .attr('title', 'Kliknij, aby zmienić')
      .removeClass('is-editing')
      .addClass('is-editable')
      .text(value);
  }

  $('.page-actions > li:first-child > .btn').focus();

  if (location.hash.indexOf('#order-') === 0)
  {
    var $tr = $(location.hash);
    var pos = $tr.position();

    if (pos)
    {
      $('html, body').animate({scrollTop: pos.top - $tr.outerHeight() - 15}, 100);
    }
  }
});
</script>
<? append_slot() ?>
