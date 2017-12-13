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

// Promisify and export message methods
module.exports.sqs = sqs;
module.exports.sqs.sendMessage = Promise.promisify(sqs.sendMessage);
module.exports.sqs.receiveMessage = Promise.promisify(sqs.receiveMessage);
module.exports.sqs.deleteMessage = Promise.promisify(sqs.deleteMessage);
