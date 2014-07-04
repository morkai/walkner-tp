<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

orders_check_access();

bad_request_if(empty($_GET['id']));

$order = fetch_one('SELECT * FROM orders WHERE id=?', array(1 => $_GET['id']));

not_found_if(empty($order));

unset($order->password);

escape($order);

?>

<? decorate($order->id . ' - Zamówienia') ?>

<div class="page-header">
  <ul class="page-actions">
    <li><a class="btn btn-default" href="<?= url_for("orders/edit.php?id={$order->id}") ?>"><i class="fa fa-edit"></i> Edytuj zamówienie</a>
    <? if (user_has_role('admin')): ?>
    <li><a class="btn btn-danger" href="<?= url_for("orders/delete.php?id={$order->id}") ?>"><i class="fa fa-times"></i> Usuń zamówienie</a>
    <? endif ?>
  </ul>
  <h1>
    <a href="<?= url_for("orders") ?>">Zamówienia</a> \
    <?= $order->id ?>
  </h1>
</div>

<div class="well">
  <dl class="properties">
    <dt>ID:
    <dd><?= $order->id ?>
    <dt>Dotyczy:
    <dd class="pre"><?= $order->summary ?>
  </dl>
  <h1>TODO</h1>
</div>

<? begin_slot('js') ?>
<script>
  $(function()
  {
    $('.btn-danger').on('click', function()
    {
      return confirm('Czy na pewno chcesz bezpowrotnie usunąć wybrane zamówienie?');
    });
  });
</script>
<? append_slot() ?>
