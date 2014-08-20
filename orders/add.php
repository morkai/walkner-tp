<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

orders_check_access();

no_access_if(user_has_role('driver'));

$user = user_get_data();

if (!empty($_POST['order']))
{
  $order = orders_prepare_data($_POST['order']);
  $order['createdAt'] = date('Y-m-d H:i:s');
  $order['creator'] = $user->id;
  $items = $order['items'];

  unset($order['items']);

  $db = get_conn();

  try
  {
    $db->beginTransaction();

    exec_insert('orders', $order);

    $orderId = $db->lastInsertId();

    foreach ($items as $item)
    {
      $item['order'] = $orderId;

      exec_insert('order_items', $item);
    }

    $db->commit();
  }
  catch (Exception $x)
  {
    $db->rollBack();

    set_flash("Dodawanie zamówienia nie powiodło się: {$x->getMessage()}", 'error');

    $order['items'] = $items;

    goto VIEW;
  }

  set_flash('Nowe zamówienie zostało dodane pomyślnie!');
  go_to("/orders/view.php?id={$orderId}");
}

VIEW:

$order = (object)(!empty($order) ? $order : array(
  'summary' => '',
  'owner' => $user->id,
  'ownerName' => $user->name,
  'items' => array(
    array(
      'what' => '',
      'whenTo' => '',
      'who' => '',
      'passengers' => 1,
      'from' => '',
      'to' => '',
      'symbol' => $user->symbol,
      'time' => 0
    )
  )
));

foreach ($order->items as $i => $item)
{
  $item = (object)$item;
  $item->time = empty($item->whenTo) ? 0 : (strtotime($item->whenTo) * 1000);

  $order->items[$i] = $item;
}

$editing = false;

?>

<? decorate("Dodawanie / Zamówienie") ?>

<div class="page-header">
  <h1>
    <a href="<?= url_for("orders") ?>">Zamówienia</a> \
    Dodawanie
  </h1>
</div>

<form action="<?= url_for("orders/add.php") ?>" method=post autocomplete=off>
  <? include __DIR__ . '/__form__.php' ?>
</form>
