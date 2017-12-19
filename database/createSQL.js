// Run this file on its own before starting the app

import connection from './index';

connection.pingAsync()
  .then(() => console.log('Connection to mySQL successful'))
  .catch(err => console.log('Error: No response to mySQL ping. ', err))
  // create airbnb database
  .then(() => connection.queryAsync('CREATE DATABASE IF NOT EXISTS airbnb'))
  .then(() => connection.queryAsync('USE airbnb'))
  .catch(err => console.log('Error creating/using mySQL airbnb database ', err))
  // cities table
  .then(() => connection.queryAsync('CREATE TABLE IF NOT EXISTS cities ' +
    '(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
    'name VARCHAR(255) NOT NULL)'))
  // neighborhoods table
  .then(() => connection.queryAsync('CREATE TABLE IF NOT EXISTS neighborhoods ' +
    '(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
    'name VARCHAR(255) NOT NULL, ' +
    'id_cities INT NULL DEFAULT NULL, ' +
    'FOREIGN KEY (id_cities) REFERENCES cities(id))'))
  // hosts table
  .then(() => connection.queryAsync('CREATE TABLE IF NOT EXISTS hosts ' +
    '(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
    'first_name VARCHAR(25) NOT NULL, ' +
    'last_name VARCHAR(25) NOT NULL)'))
  // homes table
  .then(() => connection.queryAsync('CREATE TABLE IF NOT EXISTS homes ' +
    '(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
    'id_neighborhoods INT NULL DEFAULT NULL, ' +
    'id_cities INT NULL DEFAULT NULL, ' +
    'address VARCHAR(255) NOT NULL, ' +
    'id_hosts INT NULL DEFAULT NULL, ' +
    'max_guests TINYINT NOT NULL DEFAULT 1, ' +
    'price_usd SMALLINT NOT NULL DEFAULT 1, ' +
    'instant_book TINYINT NOT NULL DEFAULT 0, ' +
    'entire_home TINYINT NOT NULL DEFAULT 1, ' +
    'private TINYINT NOT NULL DEFAULT 1, ' +
    'parent_id INT NULL DEFAULT NULL, ' +
    'photos MEDIUMTEXT NULL DEFAULT NULL, ' +
    'FOREIGN KEY (id_cities) REFERENCES cities(id), ' +
    'FOREIGN KEY (id_neighborhoods) REFERENCES neighborhoods(id), ' +
    'FOREIGN KEY (id_hosts) REFERENCES hosts(id), ' +
    'FOREIGN KEY (parent_id) REFERENCES homes(id))'))
  // bookings table
  .then(() => connection.queryAsync('CREATE TABLE IF NOT EXISTS reservations ' +
    '(id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, ' +
    'date DATE NOT NULL, ' +
    'homes_id INT NOT NULL, ' +
    'FOREIGN KEY (homes_id) REFERENCES homes(id))'))
  .then(() => console.log('Database has been created successfully'))
  .tap(() => connection.destroy())
  .tap(() => process.exit())
  .catch(err => console.log('Error initializing mySQL database: ', err));
