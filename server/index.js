import {} from 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import sql from '../database/index';
import sqs from './setupSQS';

// import redis from '../database/redis.js';
// import redis from 'redis';

sql.pingAsync()
  .catch(err => console.log('Error: No response to mySQL ping \n', err))
  .then(() => sql.queryAsync('USE airbnb'))
  .catch(err => console.log('Error: Can\'t connect to the airbnb database \n', err));

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Welcome to the home inventory service'));

app.get('/homes?:id', (req, res) => (
  // Note, this object syntax isn't supported for batch inserting!
  sql.queryAsync('SELECT * FROM homes WHERE id = ?', [req.query.id])
    .then(rows => res.status(200).send(rows[0]))
    .catch(err => res.status(500).send(err))
));

app.post('/homes', (req, res) => (
  // Note, this object syntax isn't supported for batch inserting!
  sql.queryAsync('INSERT INTO homes SET ?', [req.body])
    .tap(() => res.status(201).send(req.body))
    .then(result => {
      req.body.id = result.insertId;
      sqs.sendToClient(JSON.stringify(req.body));
      sqs.sendToReservations(JSON.stringify(req.body));
    })
    .catch(err => res.status(500).send(err))
));

app.patch('/homes', (req, res) => (
  sql.queryAsync('UPDATE homes SET ? WHERE id = ?', [req.body, req.body.id])
    .then(() => sql.queryAsync('SELECT FROM homes WHERE id = ', [req.body.id]))
    .tap(rows => sqs.sendToClient(JSON.stringify(rows[0])))
    .tap(rows => sqs.sendToReservations(JSON.stringify(rows[0])))
    .then(rows => res.status(201).send(rows[0]))
    .catch(err => res.status(500).send(err))
));

if (!module.parent) {
  app.listen(process.env.PORT, () =>
    console.log(`Express server is listening on port ${process.env.PORT}`));
}

export default app; // this is for test suite
