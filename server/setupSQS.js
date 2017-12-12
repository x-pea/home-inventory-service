import { Promise } from 'bluebird';
import { config } from 'dotenv';
import AWS from 'aws-sdk';

config();
AWS.config = new AWS.Config();
AWS.config.update({
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1'
});

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

// Promisify and export message methods
sqs.sendMessage = Promise.promisify(sqs.sendMessage);
sqs.receiveMessage = Promise.promisify(sqs.receiveMessage);
sqs.deleteMessage = Promise.promisify(sqs.deleteMessage);

export default sqs;
