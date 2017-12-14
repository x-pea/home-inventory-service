import {} from 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import * as createSQL from '../database/createSQL';
import seedSQL from '../database/seedSQL';
import sqs from '../server/setupSQS.js';

// import * as dbHelpers from '../database/dbHelpers';
// import redis from '../database/redis.js';
// import redis from 'redis';

createSQL.init()
  .then(() => seedSQL());

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Welcome to the home inventory service'));

app.post('/homes', (req, res) => {
  // Note, this object syntax isn't supported for batch inserting!
  createSQL.connection.queryAsync('INSERT INTO homes SET ?', [req.body])
    .tap(() => sqs.sendToClient(JSON.stringify({ newPost: req.body })))
    .tap(() => sqs.sendToReservations(JSON.stringify({ newPost: req.body })))
    .then(() => res.status(201).send(req.body))
    .catch(err => res.status(500).send(err));
});

app.patch('/homes', (req, res) => {
  const updateData = Object.assign({}, req.body);
  delete updateData.id;
  createSQL.connection.queryAsync('UPDATE homes SET ? WHERE id = ?', [updateData, req.body.id])
    .tap(() => sqs.sendToClient(JSON.stringify({ update: req.body })))
    .tap(() => sqs.sendToReservations(JSON.stringify({ update: req.body })))
    .then(() => res.status(201).send(req.body))
    .catch(err => res.status(500).send(err));
});

if (!module.parent) {
  app.listen(process.env.PORT, () => console.log(`Express server is listening on port ${process.env.PORT}`));
}

export default app; // this is for test suite
