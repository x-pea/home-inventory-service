import {} from 'dotenv/config';
import { Promise } from 'bluebird';
import Consumer from 'sqs-consumer';
import sql from '../database/index';


// Set the long-polling tools on incoming queues

const queueFromReservations = Consumer.create({
  queueUrl: process.env.SQS_QUEUE_URL2,
  region: 'us-west-1',
  waitTimeSeconds: 10,
  batchSize: 10,
  visibilityTimeout: 30,
  // terminateVisibilityTimeout: true,
  handleMessage: (message, done) => {
    handleResMess(message) // eslint-disable-line no-use-before-define
      .then(() => done())
      .catch(err => console.log('error in handleMessage: ', err));
  },
});
queueFromReservations.on('sqs-consumer error: ', err => console.log(err.message));
queueFromReservations.start();

/*
Message from reservations will look like this:
  { dateAvailability: { '3': [1, 2, 1, 12, 3, 5, 5, 7] },
    rental: '9bd9dac7-8020-4dbd-890d28' }
*/
function handleResMess(msg) {
  const dates = [];
  const message = JSON.parse(msg.Body);

  Object.keys(message.dateAvailability).forEach(el => {
    const month = (`0${el.toString()}`).slice(-2);
    // Start at 1 because there's no calendar day 0
    for (let i = 1; i < message.dateAvailability[el].length; i += 1) {
      const day = (`0${message.dateAvailability[el][i].toString()}`).slice(-2);
      dates.push(`2018-${month}-${day}`);
    }
  });

  return Promise.map(dates, date => (
    sql.queryAsync('INSERT INTO reservations ' +
      'SET ?', [{ date, homes_id: message.rental }])
  ))
    .catch(err => console.log(err));
}

export { handleResMess, queueFromReservations };

/* MIGHT NOT USE CLIENT QUEUE */
// const queueFromClient = Consumer.create({
//   queueUrl: process.env.SQS_QUEUE_URL2,
//   handleMessage: (message, done) => {
//     console.log('Message from queue1: ', message);
//     handleClientMess(message) // eslint-disable-line no-use-before-define
//       .then(() => done());
//   }
// });
// queueFromClient.on('sqs-consumer error: ', err => console.log(err.message));
// queueFromClient.start();

/*
Message from client will look like this:
  { id: 23456 }
*/
// function handleClientMess(message) {
//   // interpret message
//   // send response
//   const reply = { message, homes: [] }; // placeholder
//   sqs.sendToClient(reply);
// }
