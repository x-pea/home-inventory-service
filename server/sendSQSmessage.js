const Promise = require('bluebird');
require('dotenv').config();
// Load the AWS SDK for Node.js
const AWS = require('aws-sdk');

AWS.config = new AWS.Config();
AWS.config.update({
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-west-1'
});

// Create an SQS service object
const sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

const params = {
  DelaySeconds: 10,
  MessageAttributes: {
    Title: {
      DataType: 'String',
      StringValue: 'The Whistler'
    },
    Author: {
      DataType: 'String',
      StringValue: 'John Grisham'
    },
    WeeksOn: {
      DataType: 'Number',
      StringValue: '6'
    }
  },
  MessageBody: 'Information about current NY Times fiction bestseller for week of 12/11/2016.',
  QueueUrl: process.env.SQS_QUEUE_URL
};

sqs.sendMessage = Promise.promisify(sqs.sendMessage);

sqs.sendMessage(params)
  .then(data => console.log('Success', data.MessageId))
  .catch(err => console.log('Error', err));

