<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include __DIR__ . '/__common__.php';

no_access_if_not(user_has_role('driver'));

bad_request_if(empty($_POST['id']));

$field = !empty($_POST['field']) && in_array($_POST['field'], array('whenFrom', 'km')) ? $_POST['field'] : null;
$value = array_key_exists('value', $_POST) && is_string($_POST['value']) ? $_POST['value'] : '';

switch ($field)
{
  case 'whenFrom':
    if (empty($value))
    {
      $value = null;
    }
    else if (!preg_match('/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$/', $value))
    {
      bad_request();
    }
    else
    {
      $value .= ':00';
    }
    break;

  case 'km':
    $value = (float)$value;

    if ($value < 0)
    {
      bad_request();
    }
    break;

  default:
    bad_request();
}

$orderItem = fetch_one('SELECT id, driver FROM order_items WHERE id=?', array(1 => $_POST['id']));

not_found_if(empty($orderItem));

no_access_if($orderItem->driver !== user_get_data()->id);

exec_update('order_items', array($field => $value), "id={$orderItem->id}");
