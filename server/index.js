import {} from 'dotenv/config';
import express from 'express';
import * as createSQL from '../database/createSQL';
import seedSQL from '../database/seedSQL';
import redis from '../database/redis.js';
// import redis from 'redis';

createSQL.init()
  // .then(() => seedSQL());

const app = express();

app.get('/', (req, res) => res.send('Welcome to the home inventory service'));

if (!module.parent) {
  app.listen(process.env.PORT, () => console.log(`Express server is listening on port ${process.env.PORT}`));
}

export default app; // this is for test suite
