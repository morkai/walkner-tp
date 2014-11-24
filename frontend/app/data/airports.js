// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-tp project <http://lukasz.walukiewicz.eu/p/walkner-tp>

define([

], function(

) {
  'use strict';

  var list = [
    {
      toponym: 'Białystok- Krywlany',
      name: 'Lotnisko Białystok- Krywlany',
      city: 'Białystok',
      icao: 'EPBK',
      iata: 'QYY'
    },
    {
      toponym: 'Bielsko-Biała- Aleksandrowice',
      name: 'Lotnisko Bielsko-Biała- Aleksandrowice',
      city: 'Bielsko-Biała',
      icao: 'EPBA',
      iata: 'QEO'
    },
    {
      toponym: 'Bydgoszcz- Szwederowo',
      name: 'Port lotniczy im. Ignacego Jana Paderewskiego',
      city: 'Bydgoszcz',
      icao: 'EPBY',
      iata: 'BZG'
    },
    {
      toponym: 'Częstochowa- Rudniki',
      name: 'Lądowisko Częstochowa-Rudniki',
      city: 'Częstochowa',
      icao: 'EPRU',
      iata: 'CZW'
    },
    {
      toponym: 'Elbląg',
      name: 'Lotnisko Elbląg',
      city: 'Elbląg',
      icao: 'EPEL',
      iata: 'ZBG'
    },
    {
      toponym: 'Gdańsk- Rębiechowo',
      name: 'Port lotniczy im. Lecha Wałęsy',
      city: 'Gdańsk',
      icao: 'EPGD',
      iata: 'GDN'
    },
    {
      toponym: 'Gliwice- Trynek',
      name: 'Lotnisko Gliwice- Trynek',
      city: 'Gliwice',
      icao: 'EPGL',
      iata: 'QLC'
    },
    {
      toponym: 'MPL Katowice - Pyrzowice',
      name: 'Międzynarodowy Port Lotniczy Katowice',
      city: 'Katowice (Pyrzowice)',
      icao: 'EPKT',
      iata: 'KTW'
    },
    {
      toponym: 'Kielce-Masłów',
      name: 'Lotnisko Kielce-Masłów',
      city: 'Kielce',
      icao: 'EPKA',
      iata: 'QKI'
    },
    {
      toponym: 'Koszalin- Zegrze Pomorskie',
      name: 'Lotnisko Koszalin-Zegrze Pomorskie',
      city: 'Koszalin',
      icao: 'EPKO',
      iata: 'OSZ'
    },
    {
      toponym: 'Kraków-Balice',
      name: 'Kraków Airport im. Jana Pawła II',
      city: 'Kraków',
      icao: 'EPKK',
      iata: 'KRK'
    },
    {
      toponym: 'Lublin',
      name: 'Port Lotniczy Lublin',
      city: 'Świdnik k. Lublina',
      icao: 'EPLB',
      iata: 'LUZ'
    },
    {
      toponym: 'Lublin- Radawiec',
      name: 'Lotnisko Lublin-Radawiec',
      city: 'Lublin',
      icao: 'EPLR',
      iata: 'QLU'
    },
    {
      toponym: 'Łódź-Lublinek',
      name: 'Port lotniczy im. Władysława Reymonta',
      city: 'Łódź',
      icao: 'EPLL',
      iata: 'LCJ'
    },
    {
      toponym: 'Modlin',
      name: 'Port lotniczy Modlin',
      city: 'Nowy Dwór Mazowiecki',
      icao: 'EPMO',
      iata: 'WMI'
    },
    {
      toponym: 'Nowy Targ',
      name: 'Lotnisko Nowy Targ',
      city: 'Nowy Targ',
      icao: 'EPNT',
      iata: 'QWS'
    },
    {
      toponym: 'Olsztyn- Dajtki',
      name: 'Lotnisko Olsztyn- Dajtki',
      city: 'Olsztyn',
      icao: 'EPOD',
      iata: 'QYO'
    },
    {
      toponym: 'Opole- Polska Nowa Wieś',
      name: 'Lotnisko Opole-Polska Nowa Wieś',
      city: 'Opole',
      icao: 'EPOP',
      iata: 'QPM'
    },
    {
      toponym: 'Ostrów Wielkopolski- Michałków',
      name: 'Lotnisko Ostrów Wielkopolski- Michałków',
      city: 'Ostrów Wielkopolski',
      icao: 'EPOM',
      iata: 'QDG'
    },
    {
      toponym: 'Płock',
      name: 'Lotnisko Płock',
      city: 'Płock',
      icao: 'EPPL',
      iata: 'QPC'
    },
    {
      toponym: 'Poznań- Ławica',
      name: 'Port lotniczy im. Henryka Wieniawskiego',
      city: 'Poznań',
      icao: 'EPPO',
      iata: 'POZ'
    },
    {
      toponym: 'Radom- Sadków',
      name: 'Port lotniczy Radom',
      city: 'Radom',
      icao: 'EPRA',
      iata: 'RDO'
    },
    {
      toponym: 'Rzeszów- Jasionka (EPRZ)',
      name: 'Port lotniczy Rzeszów- Jasionka',
      city: 'Rzeszów',
      icao: 'EPRZ',
      iata: 'RZE'
    },
    {
      toponym: 'Stalowa Wola-Turbia',
      name: 'Lotnisko Stalowa Wola-Turbia',
      city: 'Stalowa Wola',
      icao: 'EPST',
      iata: 'QXQ'
    },
    {
      toponym: 'Suwałki',
      name: 'Lotnisko Suwałki',
      city: 'Suwałki',
      icao: 'EPSU',
      iata: 'ZWK'
    },
    {
      toponym: 'Szczecin- Goleniów',
      name: 'Port lotniczy im. NSZZ \'Solidarność\'',
      city: 'Szczecin',
      icao: 'EPSC',
      iata: 'SZZ'
    },
    {
      toponym: 'Szczytno- Szymany',
      name: 'Port lotniczy Szczytno- Szymany',
      city: 'Szczytno',
      icao: 'EPSY',
      iata: 'SZY'
    },
    {
      toponym: 'Warszawa- Okęcie',
      name: 'Lotnisko Chopina',
      city: 'Warszawa',
      icao: 'EPWA',
      iata: 'WAW'
    },
    {
      toponym: 'Wilno',
      name: 'Międzynarodowy port lotniczy Wilno',
      city: 'Wilno',
      icao: 'EYVI',
      iata: 'VNO'
    },
    {
      toponym: 'Włocławek- Kruszyn',
      name: 'Lotnisko Włocławek-Kruszyn',
      city: 'Włocławek',
      icao: 'EPWK',
      iata: 'QWK'
    },
    {
      toponym: 'Wrocław- Strachowice',
      name: 'Port lotniczy im. Mikołaja Kopernika',
      city: 'Wrocław',
      icao: 'EPWR',
      iata: 'WRO'
    },
    {
      toponym: 'Zielona Góra- Babimost',
      name: 'Port lotniczy Zielona Góra- Babimost',
      city: 'Zielona Góra',
      icao: 'EPZG',
      iata: 'IEG'
    }
  ];

  var map = {};
  var select2 = [];

  list.forEach(function(airport)
  {
    map[airport.iata] = airport;
    select2.push({
      id: airport.iata,
      text: airport.toponym + '; ' + airport.name + '; ' + airport.city + '; ' + airport.iata,
      airport: airport
    });
  });

  return {
    list: list,
    map: map,
    select2: select2,
    getLabel: function(iata)
    {
      var airport = map[iata];

      if (!airport)
      {
        return null;
      }

      return airport.name + ' (' + airport.iata + ')';
    }
  };
});
