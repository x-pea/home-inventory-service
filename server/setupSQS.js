import { Promise } from 'bluebird';
import { config } from 'dotenv';
import AWS from 'aws-sdk';
import Consumer from 'sqs-consumer';

config();

AWS.config = new AWS.Config();
AWS.config.update({
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1'
});

// Set the long-polling tool on incoming queue
const queue1Poll = Consumer.create({
  queueUrl: process.env.SQS_TESTQUEUE_URL, // replace with real queue
  handleMessage: (message, done) => {
    console.log('Message from queue1: ', message);
    done();
  }
});
queue1Poll.on('sqs-consumer error: ', err => console.log(err.message));
queue1Poll.start();

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// Promisify message methods
sqs.sendMessage = Promise.promisify(sqs.sendMessage);
sqs.receiveMessage = Promise.promisify(sqs.receiveMessage);
sqs.deleteMessage = Promise.promisify(sqs.deleteMessage);

const reservationSendingParams = {
  DelaySeconds: 0,
  MessageAttributes: {
    Greeting: {
      DataType: 'String',
      StringValue: 'Hello, Reservations!'
    }
  },
  MessageBody: 'A sample message to test SQS',
  QueueUrl: process.env.SQS_RESERVATIONSQUEUE_URL
};

sqs.sendToReservations = message => {
  const params = Object.assign({}, reservationSendingParams);
  params.MessageBody = message;
  return sqs.sendMessage(params)
    .catch(err => console.log('sqs sending-to-reservations error: ', err.message));
};

const clientSendingParams = {
  DelaySeconds: 0,
  MessageAttributes: {
    Greeting: {
      DataType: 'String',
      StringValue: 'Hello, Client Service!'
    }
  },
  MessageBody: 'A sample message to test SQS',
  QueueUrl: process.env.SQS_CLIENTQUEUE_URL
};

sqs.sendToClient = message => {
  const params = Object.assign({}, clientSendingParams);
  params.MessageBody = message;
  return sqs.sendMessage(params)
    .catch(err => console.log('sqs sending-to-client error: ', err.message));
};

export default sqs;

/* Below test for my own queue */
// const queue1SendingParams = {
//   DelaySeconds: 0,
//   MessageAttributes: {
//     Greeting: {
//       DataType: 'String',
//       StringValue: 'Hello, Tester!'
//     }
//   },
//   MessageBody: 'A sample message to test SQS',
//   QueueUrl: process.env.SQS_TESTQUEUE_URL // replace with real queue
// };

// sqs.sendMessage(queue1SendingParams)
//   .catch(err => console.log('sqs sending-to-queue1 error: ', err.message));

