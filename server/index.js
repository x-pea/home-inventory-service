import {} from 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import * as createSQL from '../database/createSQL';
import seedSQL from '../database/seedSQL';
import * as dbHelpers from '../database/dbHelpers';
// import redis from '../database/redis.js';
// import redis from 'redis';

createSQL.init()
  .then(() => seedSQL());

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Welcome to the home inventory service'));

app.post('/homes', (req, res) => {
  dbHelpers.saveNewHomes(req.body)
    .then(() => res.status(201).send())
    .catch(err => res.status(500).send(err));
});

if (!module.parent) {
  app.listen(process.env.PORT, () => console.log(`Express server is listening on port ${process.env.PORT}`));
}

export default app; // this is for test suite
