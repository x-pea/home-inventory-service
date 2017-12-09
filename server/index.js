require('dotenv').config();
const createSQL = require('../database/createSQL');
const seedSQL = require('../database/seedSQL');

// require('../database/seedSQL');
const express = require('express');

createSQL.init();
seedSQL.init();

const app = express();
app.get('/', (req, res) => res.send('Welcome to the home inventory service'));

if (module.parent) {
  module.exports = app; // this is for test suite
} else {
  app.listen(process.env.PORT, () => console.log(`Express server is listening on port ${process.env.PORT}`));
}
