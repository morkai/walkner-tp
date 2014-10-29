// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([

], function(

) {
  'use strict';

  var select2 = [
    {
      text: 'Produkcja',
      children: [
        {id: 'PL02ML01', text: 'Dyrekcja i administracja'},
        {id: 'PL02ML02', text: 'Dział inżynierii procesu'},
        {id: 'PL02ML08', text: 'Produkcja - infrastruktura (RE)'}
      ]
    },
    {
      text: 'Dział logistyki',
      children: [
        {id: 'PL02ML03', text: 'Dział logistyki'},
        {id: 'PL02ML30', text: 'Planowanie produkcji'},
        {id: 'PL02ML31', text: 'Zaopatrzenie produkcyjne'},
        {id: 'PL02ML32', text: 'Planowanie IPSC – order desk'}
      ]
    },
    {
      text: 'Centrum produkcji A',
      children: [
        {id: 'PL02ML04', text: 'Centrum produkcji opraw A'},
        {id: 'PL02ML40', text: 'Obróbka mechaniczna A'},
        {id: 'PL02ML41', text: 'Montaż optyki własnej'},
        {id: 'PL02ML42', text: 'Montaż optyki do klienta'},
        {id: 'PL02ML43', text: 'Montaż opraw A INDOOR'},
        {id: 'PL02ML44', text: 'Montaż opraw A OUTDOOR'}
      ]
    },
    {
      text: 'Centrum produkcji B',
      children: [
        {id: 'PL02ML05', text: 'Centrum produkcji opraw B'},
        {id: 'PL02ML50', text: 'Obróbka mechaniczna B'},
        {id: 'PL02ML51', text: 'Montaż opraw B INDOOR'},
        {id: 'PL02ML52', text: 'Montaż opraw B OUTDOOR'}
      ]
    },
    {
      text: 'Centrum produkcji C',
      children: [
        {id: 'PL02ML06', text: 'Centrum produkcji opraw C'},
        {id: 'PL02ML60', text: 'Obróbka mechaniczna C'},
        {id: 'PL02ML61', text: 'Montaż opraw C INDOOR'},
        {id: 'PL02ML62', text: 'Montaż opraw C OUTDOOR'}
      ]
    },
    {
      text: 'Centrum produkcji D',
      children: [
        {id: 'PL02ML07', text: 'Centrum produkcji opraw D'},
        {id: 'PL02ML70', text: 'Obróbka mechaniczna D'},
        {id: 'PL02ML71', text: 'LAKIERNIA'},
        {id: 'PL02ML72', text: 'Montaż opraw D INDOOR'},
        {id: 'PL02ML73', text: 'Montaż opraw D OUTDOOR'},
        {id: 'PL02ML74', text: 'Drukowanie nalepek'}
      ]
    },
    {
      text: 'Sekcja utrzymania ruchu',
      children: [
        {id: 'PL02ML80', text: 'Sekcja utrzymania ruchu'}
      ]
    },
    {
      text: 'Factory Distribution',
      children: [
        {id: 'PL02ML09', text: 'Administracja FD'},
        {id: 'PL02ML91', text: 'Magazynowanie - wyroby'},
        {id: 'PL02ML92', text: 'Magazynowanie - komponenty'},
        {id: 'PL02ML93', text: 'Transport'},
        {id: 'PL02ML94', text: 'Odprawy celne'},
        {id: 'PL02ML95', text: 'Reklamacje transportowe'}
      ]
    },
    {
      text: 'Utrzymanie ruchu',
      children: [
        {id: 'PL02TS01', text: 'Infrastruktura'},
        {id: 'PL02TS02', text: 'Infrastruktura - GAZ'},
        {id: 'PL02TS06', text: 'Infrastruktura - TFM'}
      ]
    },
    {
      text: 'Administracja',
      children: [
        {id: 'PL02AD01', text: 'Zarząd spółki'},
        {id: 'PL02AD02', text: 'Związki zawodowe'},
        {id: 'PL02AD03', text: 'Biuro zarządu'},
        {id: 'PL02AD05', text: 'Dział kontroli finansowej'},
        {id: 'PL02AD06', text: 'SBSF - INFOSYS (usł. ksiegowe)'},
        {id: 'PL02AD07', text: 'Dział personalny'},
        {id: 'PL02AD08', text: 'HR manager'},
        {id: 'PL02AD13', text: 'Dział zakupów'},
        {id: 'PL02AD14', text: 'SQM'},
        {id: 'PL02AD15', text: 'Dział jakości'},
        {id: 'PL02AD24', text: 'Koszty IT (w biznesie)'},
        {id: 'PL02AD26', text: 'O&E'},
        {id: 'PL02AD28', text: 'Quality (counterclaims)'},
        {id: 'PL02AD29', text: 'CT Purchasing (counterclaims)'}
      ]
    },
    {
      text: 'Sektor badań i rozwoju',
      children: [
        {id: 'PL02RD10', text: 'Sekcja konstr. OIH'},
        {id: 'PL02RD11', text: 'Sekcja konstr. OUTDOOR'},
        {id: 'PL02RD12', text: 'Zakupy - sekcja konstr (PPB)'},
        {id: 'PL02RD13', text: 'Sekcja konstr. qualit'},
        {id: 'PL02RD02', text: 'Sekcja konstrukcyjna FD'},
        {id: 'PL02RD03', text: 'Laboratorium'},
        {id: 'PL02RD04', text: 'Sekcja menadżerów produktu'},
        {id: 'PL02RD05', text: 'ETO'},
        {id: 'PL02TT30', text: 'Transfer team'}
      ]
    },
    {
      text: 'Sektor IT',
      children: [
        {id: 'PL02ITI1', text: 'Infrastruktura IT'},
        {id: 'PL02ITA1', text: 'Aplikacje IT'}
      ]
    }
  ];

  var map = {};

  select2.forEach(function(group)
  {
    group.children.forEach(function(symbol)
    {
      map[symbol.id] = symbol.text;
    });
  });

  return {
    map: map,
    select2: select2,
    getLabel: function(symbol)
    {
      var text = map[symbol];

      if (!text)
      {
        return null;
      }

      return text + ' (' + symbol + ')';
    }
  };
});
