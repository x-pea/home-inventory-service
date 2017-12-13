import * as createSQL from './createSQL';

// homes param should be array of objects or arrays (batch insertions)
export function saveNewHomes(homes) {
  return createSQL.connection.queryAsync('INSERT INTO homes SET ?', [homes]);
}

/* sample homes argument:

  {
    id_neighborhoods: 235,
    id_cities: 32,
    address: '988 Main Street',
    max_guests: 4,
    price_usd: 95,
    instant_book: 0,
    photos: 'http://www.fakeimage.com/img823.jpg',
    entire_home: 1,
    private: 1,
    id_hosts: 87352
  }

*/
