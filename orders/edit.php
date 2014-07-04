<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

orders_check_access();

bad_request_if(empty($_GET['id']));

$q = <<<SQL
SELECT o.*, u.name AS ownerName
FROM orders AS o
INNER JOIN users AS u ON o.owner=u.id
WHERE o.id=?
LIMIT 1
SQL;

$order = fetch_one($q, array(1 => $_GET['id']));

not_found_if(empty($order));

$order->items = fetch_all('SELECT * FROM order_items WHERE `order`=?', array(1 => $order->id));

if (!empty($_POST['order']))
{
  $data = orders_prepare_data($_POST['order']);

  exec_update('orders', $data, "id={$order->id}");

  set_flash('Zamówienie zostało zmodyfikowane pomyślnie!');
  go_to(get_referer("/orders/view.php?id={$order->id}"));
}

foreach ($order->items as $item)
{
  $item->time = empty($item->whenTo) ? 0 : (strtotime($item->whenTo) * 1000);
}

escape($order);

$editing = true;

?>

<? decorate("Edycja / {$order->id} / Zamówienia") ?>

<div class="page-header">
  <h1>
    <a href="<?= url_for("orders") ?>">Zamówienia</a> \
    <a href="<?= url_for("orders/view.php?id={$order->id}") ?>"><?= $order->id ?></a> \
    Edycja
  </h1>
</div>

<form action="<?= url_for("orders/edit.php?id={$order->id}") ?>" method=post autocomplete=off>
  <? include __DIR__ . '/__form__.php' ?>
</form>
