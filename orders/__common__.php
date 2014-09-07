<?php

// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

include_once __DIR__ . '/../__common__.php';

function orders_prepare_data($data)
{
  $data['owner'] = (int)$data['owner'];

  $items = array();

  foreach ($data['items']['what'] as $i => $_)
  {
    preg_match('/([0-9]{4}).*?([0-9]{2}).*?([0-9]{2}).*?([0-9]{2}).*?([0-9]{2})/', $data['items']['whenTo'][$i], $whenToMatches);

    $who = array_filter(array_map('trim', preg_split('/\r\n|\n|\r/', $data['items']['who'][$i])), function($passenger) { return !empty($passenger); });

    $items[] = array(
      'what' => trim($data['items']['what'][$i]),
      'whenTo' => "{$whenToMatches[1]}-{$whenToMatches[2]}-{$whenToMatches[3]} {$whenToMatches[4]}:{$whenToMatches[5]}:00",
      'who' => join("\n", $who),
      'passengers' => (int)$data['items']['passengers'][$i],
      'from' => trim($data['items']['from'][$i]),
      'to' => trim($data['items']['to'][$i]),
      'symbol' => trim($data['items']['symbol'][$i])
    );
  }

  usort($items, function($a, $b)
  {
    return strtotime($a['when']) - strtotime($b['when']);
  });

  $data['items'] = $items;
  $data['whenMin'] = $items[0]['whenTo'];
  $data['whenMax'] = $items[count($items) - 1]['whenTo'];

  return $data;
}

function orders_check_access()
{
  no_access_if_not(user_is_logged_in());
}
