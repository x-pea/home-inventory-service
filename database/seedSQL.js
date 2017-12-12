// const mysql = require('mysql');
import faker from 'faker';
import * as createSQL from './createSQL';

// Hard-coded sample cities, length 387
const cities = ['Aberdeen', 'Abilene', 'Akron', 'Albany', 'Albuquerque', 'Alexandria', 'Allentown', 'Amarillo', 'Anaheim', 'Anchorage', 'Ann Arbor', 'Antioch', 'Apple Valley', 'Appleton', 'Arlington', 'Arvada', 'Asheville', 'Athens', 'Atlanta', 'Atlantic City', 'Augusta', 'Aurora', 'Austin', 'Bakersfield', 'Baltimore', 'Barnstable', 'Baton Rouge', 'Beaumont', 'Bel Air', 'Bellevue', 'Berkeley', 'Bethlehem', 'Billings', 'Birmingham', 'Bloomington', 'Boise', 'Boise City', 'Bonita Springs', 'Boston', 'Boulder', 'Bradenton', 'Bremerton', 'Bridgeport', 'Brighton', 'Brownsville', 'Bryan', 'Buffalo', 'Burbank', 'Burlington', 'Buttsville', 'Cambridge', 'Canton', 'Cape Coral', 'Carrollton', 'Cary', 'Cathedral City', 'Cedar Rapids', 'Champaign', 'Chandler', 'Charleston', 'Charlotte', 'Chattanooga', 'Chesapeake', 'Chicago', 'Chula Vista', 'Cincinnati', 'Clarke County', 'Clarksville', 'Clearwater', 'Cleveland', 'College Station', 'Colorado Springs', 'Columbia', 'Columbus', 'Concord', 'Coral Springs', 'Corona', 'Corpus Christi', 'Costa Mesa', 'Dallas', 'Daly City', 'Danbury', 'Davenport', 'Davidson County', 'Dayton', 'Daytona Beach', 'Deltona', 'Denton', 'Denver', 'Des Moines', 'Detroit', 'Downey', 'Duluth', 'Durham', 'El Monte', 'El Paso', 'Elizabeth', 'Elk Grove', 'Elkhart', 'Erie', 'Escondido', 'Eugene', 'Evansville', 'Fairfield', 'Fargo', 'Fartstoon', 'Fayetteville', 'Fitchburg', 'Flint', 'Fontana', 'Fort Collins', 'Fort Lauderdale', 'Fort Smith', 'Fort Walton Beach', 'Fort Wayne', 'Fort Worth', 'Frederick', 'Fremont', 'Fresno', 'Fullerton', 'Gainesville', 'Garden Grove', 'Garland', 'Gastonia', 'Gilbert', 'Glendale', 'Grand Prairie', 'Grand Rapids', 'Grayslake', 'Green Bay', 'GreenBay', 'Greensboro', 'Greenville', 'Gulfport-Biloxi', 'Hagerstown', 'Hampton', 'Harlingen', 'Harrisburg', 'Hartford', 'Havre de Grace', 'Hayward', 'Hemet', 'Henderson', 'Hesperia', 'Hialeah', 'Hickory', 'High Point', 'Hollywood', 'Honolulu', 'Houma', 'Houston', 'Howell', 'Huntington', 'Huntington Beach', 'Huntsville', 'Independence', 'Indianapolis', 'Inglewood', 'Irvine', 'Irving', 'Jackson', 'Jacksonville', 'Jefferson', 'Jersey City', 'Johnson City', 'Joliet', 'Kailua', 'Kalamazoo', 'Kaneohe', 'Kansas City', 'Kennewick', 'Kenosha', 'Killeen', 'Kissimmee', 'Knoxville', 'Lacey', 'Lafayette', 'Lake Charles', 'Lakeland', 'Lakewood', 'Lancaster', 'Lansing', 'Laredo', 'Las Cruces', 'Las Vegas', 'Layton', 'Leominster', 'Lewisville', 'Lexington', 'Lincoln', 'Little Rock', 'Long Beach', 'Lorain', 'Los Angeles', 'Louisville', 'Lowell', 'Lubbock', 'Macon', 'Madison', 'Manchester', 'Marina', 'Marysville', 'McAllen', 'McHenry', 'Medford', 'Melbourne', 'Memphis', 'Merced', 'Mesa', 'Mesquite', 'Miami', 'Milwaukee', 'Minneapolis', 'Miramar', 'Mission Viejo', 'Mobile', 'Modesto', 'Monroe', 'Monterey', 'Montgomery', 'Moreno Valley', 'Murfreesboro', 'Murrieta', 'Muskegon', 'Myrtle Beach', 'Naperville', 'Naples', 'Nashua', 'Nashville', 'New Bedford', 'New Haven', 'New London', 'New Orleans', 'New York', 'New York City', 'Newark', 'Newburgh', 'Newport News', 'Norfolk', 'Normal', 'Norman', 'North Charleston', 'North Las Vegas', 'North Port', 'Norwalk', 'Norwich', 'Oakland', 'Ocala', 'Oceanside', 'Odessa', 'Ogden', 'Oklahoma City', 'Olathe', 'Olympia', 'Omaha', 'Ontario', 'Orange', 'Orem', 'Orlando', 'Overland Park', 'Oxnard', 'Palm Bay', 'Palm Springs', 'Palmdale', 'Panama City', 'Pasadena', 'Paterson', 'Pembroke Pines', 'Pensacola', 'Peoria', 'Philadelphia', 'Phoenix', 'Pittsburgh', 'Plano', 'Pomona', 'Pompano Beach', 'Port Arthur', 'Port Orange', 'Port Saint Lucie', 'Port St. Lucie', 'Portland', 'Portsmouth', 'Poughkeepsie', 'Providence', 'Provo', 'Pueblo', 'Punta Gorda', 'Racine', 'Raleigh', 'Rancho Cucamonga', 'Reading', 'Redding', 'Reno', 'Richland', 'Richmond', 'Richmond County', 'Riverside', 'Roanoke', 'Rochester', 'Rockford', 'Roseville', 'Round Lake Beach', 'Sacramento', 'Saginaw', 'Saint Louis', 'Saint Paul', 'Saint Petersburg', 'Salem', 'Salinas', 'Salt Lake City', 'San Antonio', 'San Bernardino', 'San Buenaventura', 'San Diego', 'San Francisco', 'San Jose', 'Santa Ana', 'Santa Barbara', 'Santa Clara', 'Santa Clarita', 'Santa Cruz', 'Santa Maria', 'Santa Rosa', 'Sarasota', 'Savannah', 'Scottsdale', 'Scranton', 'Seaside', 'Seattle', 'Sebastian', 'Shreveport', 'Simi Valley', 'Sioux City', 'Sioux Falls', 'South Bend', 'South Lyon', 'Spartanburg', 'Spokane', 'Springdale', 'Springfield', 'St. Louis', 'St. Paul', 'St. Petersburg', 'Stamford', 'Sterling Heights', 'Stockton', 'Sunnyvale', 'Syracuse', 'Tacoma', 'Tallahassee', 'Tampa', 'Temecula', 'Tempe', 'Thornton', 'Thousand Oaks', 'Toledo', 'Topeka', 'Torrance', 'Trenton', 'Tucson', 'Tulsa', 'Tuscaloosa', 'Tyler', 'Utica', 'Vallejo', 'Vancouver', 'Vero Beach', 'Victorville', 'Virginia Beach', 'Visalia', 'Waco', 'Warren', 'Washington', 'Waterbury', 'Waterloo', 'West Covina', 'West Valley City', 'Westminster', 'Wichita', 'Wilmington', 'Winston', 'Winter Haven', 'Worcester', 'Yakima', 'Yonkers', 'York', 'Youngstown'];
// Hard-coded fake neighborhoods, use the same for each city
const neighborhoods = ['Downtown', 'Uptown', 'East Side', 'West Side'];
// Fake hosts
const fakeHosts = [];
for (let i = 0; i < 900; i += 1) {
  fakeHosts.push([faker.name.firstName(), faker.name.lastName()]);
}

// Helper functions for creating fake homes and rooms
const getAddress = () => faker.address.streetAddress();
const getCityId = firstCityId => Math.floor(firstCityId + (Math.random() * cities.length));
const getNeighborhood = firstHoodId => (
  Math.floor(firstHoodId + (Math.random() * neighborhoods.length))
);
const getPrice = () => Math.floor(40 + (Math.random() * 150));

// Save all the cities to mySQL
const insertAllCities = () => (
  createSQL.connection.queryAsync('SELECT id FROM cities ORDER BY id ASC LIMIT 1')
    .then(firstRow => {
      if (firstRow.id) { return firstRow; }
      const cityArrs = cities.map(city => [city]);
      return createSQL.connection.queryAsync('INSERT INTO cities (name) VALUES ?', [cityArrs]);
    })
    .then(res => Promise.resolve(res.insertId ? res.insertId : res.id))
    .catch(err => console.log(err))
);
/* Sample response (note insertId is the *first* insertId of the batch):
{ fieldCount: 0, affectedRows: 387, insertId: 2710, serverStatus: 2, warningCount: 0,
message: '(Records: 387  Duplicates: 0  Warnings: 0', protocol41: true, changedRows: 0 } */

// Save the fake neighborhoods for each city
const insertAllNeighborhoods = firstCityId => (
  createSQL.connection.queryAsync('SELECT id FROM neighborhoods ORDER BY id ASC LIMIT 1')
    .then(firstRow => {
      // If there are results, get the first neighborhood id
      if (firstRow.id) { return firstRow; }
      // If there are no results, save all the neighborhoods
      const hoodsToInsert = [];
      // Build up an array so we can save all in one query
      for (let i = firstCityId; i < firstCityId + cities.length; i += 1) {
        for (let j = 0; j < neighborhoods.length; j += 1) {
          hoodsToInsert.push([i, neighborhoods[j]]);
        }
      } // This will yield a response with an insertId
      return createSQL.connection.queryAsync('INSERT INTO neighborhoods ' +
        '(id_cities, name) VALUES ?', [hoodsToInsert]);
    })
    .then(res => {
      const firstHoodId = res.insertId ? res.insertId : res.id;
      return Promise.resolve({ firstCityId, firstHoodId });
    })
    .catch(err => console.log('Error saving neighborhoods: ', err.code, err.errno, err.sqlMessage))
);

// Save all the fake hosts
const insertAllHosts = ({ firstCityId, firstHoodId }) => (
  createSQL.connection.queryAsync('SELECT id FROM hosts ORDER BY id ASC LIMIT 1')
    .then(firstRow => {
      // If there are results, get the first host id
      if (firstRow.id) { return firstRow; }
      // Else if there are no results, save all the hosts
      return createSQL.connection // This will yield a response with an insertId
        .queryAsync('INSERT INTO hosts (first_name, last_name) VALUES ?', [fakeHosts]);
    })
    .then(res => {
      const firstHostId = res.insertId ? res.insertId : res.id;
      return Promise.resolve({ firstCityId, firstHoodId, firstHostId });
    })
    .catch(err => console.log('Error saving hosts: ', err.code, err.errno, err.sqlMessage))
);

// Create the fake homes (rooms come later)
const saveAllFakeHomes = ({ firstCityId, firstHoodId, firstHostId }) => {
  const fakeHomesToMakeRooms = [];
  return createSQL.connection.queryAsync('SELECT id FROM homes ORDER BY id ASC LIMIT 1')
    .then(firstRow => {
      // If there are results, get the first home id
      if (firstRow.id) { return firstRow; }
      // Else if there are no results, save all the hosts
      const fakeHomes = [];
      const totalToCreate = 1000;
      let fakeHome; // create just a few for now
      for (let i = 0; i < totalToCreate; i += 1) {
        fakeHome = [getNeighborhood(firstHoodId), getCityId(firstCityId), getAddress(),
          Math.floor(Math.random() * 8), getPrice(), Math.round(Math.random()), faker.image.nightlife(),
          1, 1, null, firstHostId + Math.floor(Math.random() * fakeHosts.length)];
        fakeHomes.push(fakeHome);
        // Save the first ten to use to create single rooms for rent
        if (i < totalToCreate / 3) { fakeHomesToMakeRooms.push(fakeHome); }
      }
      // This will yield a response with an insertId
      return createSQL.connection.queryAsync('INSERT INTO homes ' +
        '(id_neighborhoods, id_cities, address, ' +
        'max_guests, price_usd, instant_book, photos, entire_home, ' +
        'private, parent_id, id_hosts) VALUES ?', [fakeHomes]);
    })
    .then(res => {
      const firstHomeId = res.insertId ? res.insertId : res.id;
      return Promise.resolve({
        firstCityId, firstHoodId, firstHostId, firstHomeId, fakeHomesToMakeRooms
      });
    })
    .catch(err => console.log('Error saving homes: ', err.code, err.errno, err.sqlMessage));
};

// Create the fake rooms (see above for homes)
const saveAllFakeRooms = ({ firstHomeId, fakeHomesToMakeRooms }) => {
  const homes = fakeHomesToMakeRooms;
  const fakeRooms = [...homes];
  for (let i = 0; i < homes.length; i += 1) {
    // Give the room a random private / shared value
    fakeRooms[i][8] = Math.round(Math.random());
    // Give the room a parent id for the home it's part of
    fakeRooms[i][9] = firstHomeId + i;
    // Give the room a price lower than the entire home
    fakeRooms[i][5] = homes[i][5] * 0.3;
  }
  return createSQL.connection // This will yield a response with an insertId
    .queryAsync('INSERT INTO homes (id_neighborhoods, id_cities, address, ' +
      'max_guests, price_usd, instant_book, photos, entire_home, ' +
      'private, parent_id, id_hosts) VALUES ?', [fakeRooms]);
};

const init = () => (
  insertAllCities()
    .then(firstCityId => insertAllNeighborhoods(firstCityId))
    .tap(firstRows => console.log(firstRows))
    .then(firstRows => insertAllHosts(firstRows))
    .tap(firstRows => console.log(firstRows))
    .then(firstRows => saveAllFakeHomes(firstRows))
    .tap(firstRows => console.log(firstRows))
    .then(firstRows => saveAllFakeRooms(firstRows))
    .tap(() => console.log('Success saving all fake data!'))
    .catch(err => console.log(err))
);

export default init;
