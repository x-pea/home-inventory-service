import { config } from 'dotenv';
import { Promise } from 'bluebird';
import Consumer from 'sqs-consumer';
import sql from '../database/index';
import sqs from './setupSQS';


config();


// Set the long-polling tools on incoming queues

const queueFromReservations = Consumer.create({
  queueUrl: process.env.SQS_QUEUE_URL,
  handleMessage: (message, done) => {
    console.log('Message from queue1: ', message);
    handleResMess(message) // eslint-disable-line no-use-before-define
      .then(() => done());
  }
});
queueFromReservations.on('sqs-consumer error: ', err => console.log(err.message));
queueFromReservations.start();

const queueFromClient = Consumer.create({
  queueUrl: process.env.SQS_QUEUE_URL2,
  handleMessage: (message, done) => {
    console.log('Message from queue1: ', message);
    handleClientMess(message) // eslint-disable-line no-use-before-define
      .then(() => done());
  }
});
queueFromClient.on('sqs-consumer error: ', err => console.log(err.message));
queueFromClient.start();


/*
Message from reservations will look like this:
  { dateAvailability: { '3': [1, 2, 1, 12, 3, 5, 5, 7] },
    rental: '9bd9dac7-8020-4dbd-890d28' }
*/
function handleResMess(message) {
  const dates = [];
  Object.keys(message.dateAvailability).forEach(el => {
    const month = (`0${el.toString()}`).slice(-2);
    // Start at 1 because there's no calendar day 0
    for (let i = 1; i < message.dateAvailability[el].length; i += 1) {
      const day = (`0${message.dateAvailability[el][i].toString()}`).slice(-2);
      dates.push(`2018-${month}-${day}`);
    }
  });
  const datePromises = [];
  dates.forEach(date => {
    datePromises.push(sql.queryAsync('INSERT INTO reservations ' +
    'SET ?', [{ date, homes_id: message.rental }]));
  });
  return Promise.all(datePromises);
}

/*
Message from client will look like this:
  { }
*/
function handleClientMess(message) {
  // interpret message
  // send response
  const reply = { message, homes: [] }; // placeholder
  sqs.sendToClient(reply);
}
