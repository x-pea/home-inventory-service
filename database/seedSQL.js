// const mysql = require('mysql');
const db = require('./createSQL');

const init = () => (
  db.connection.pingAsync()
    .then(() => console.log('Connection to mySQL successful'))
    .catch(err => console.log('Error: No response to mySQL ping. ', err))
);

module.exports.init = init;
