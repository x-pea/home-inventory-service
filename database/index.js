import * as mysql from 'mysql';
import { Promise } from 'bluebird';
import {} from 'dotenv/config';

Promise.promisifyAll(require('mysql/lib/Connection').prototype);
// Promise.promisifyAll(require('mysql/lib/Pool').prototype);

const connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  user: process.env.SQL_USERNAME,
  password: process.env.SQL_PASSWORD,
});

connection.pingAsync()
  .then(() => (process.env.TEST === 1
    ? connection.queryAsync('USE airbnb_test')
    : connection.queryAsync('USE airbnb')))
  .catch(err => console.log('Problem connecting mySQL\n', err));


export default connection;
