<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

no_access_if_not(user_has_role('driver'));

bad_request_if(empty($_GET['id']));

$orderItem = fetch_one('SELECT id, `order`, driver FROM order_items WHERE id=?', array(1 => $_GET['id']));

not_found_if(empty($orderItem));

if ($orderItem->driver === null)
{
  exec_update('order_items', array('driver' => user_get_data()->id), "id={$orderItem->id}");
}
else
{
  set_flash('Wybrana pozycja ma już przypisanego kierowcę!', 'error');
}

go_to(get_referer('/orders') . '#order-' . $orderItem->order);
