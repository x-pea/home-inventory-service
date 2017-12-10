/* eslint-disable */

require('dotenv').config();
const Promise = require('bluebird');
const mysql = require('mysql');
const expect = require('chai').expect;
const createSQL = require('../database/createSQL.js');
const seedSQL = require('../database/seedSQL.js');
const server = require('../server/index.js');
// const AWS = require('aws-sdk');
const setupSQS = require('../server/setupSQS.js');
const supertest = require('supertest');
const testRequest = supertest.agent(server);

describe('** Node / Express server **', function() {

  // var dbConnection;

  // beforeEach(function(done) {
  //   dbConnection = mysql.createConnection({
  //     host: process.env.SQL_HOST,
  //     user: process.env.SQL_USERNAME,
  //     password: process.env.SQL_PASSWORD,
  //   });
  //   dbConnection.connect();
  //   done();
  // });

  // afterEach(function() {
  //   dbConnection.destroy();
  // });

  describe('The GET / route', function () {
    it('should respond with status code 200', function (done) {
      testRequest
        .get('/')
        .expect(200)
        .then(() => done());
    });
  });

}); // end tests for Node / Express server

describe('** AWS SQS **', function() {

  var receiptHandleForDeleteTest;

  describe('When sending a message', function () {
    it('should respond with an object containing the message ID', function (done) {
      const sendingParams = {
        DelaySeconds: 10,
        MessageAttributes: {
          Greeting: {
            DataType: 'String',
            StringValue: 'Hello, Tester!'
          }
        },
        MessageBody: 'A sample message to test SQS',
        QueueUrl: process.env.SQS_QUEUE_URL
      };
      setupSQS.sqs.sendMessage(sendingParams)
        .then(function(data) {
          expect(data.MessageId).to.be.a('string');
          done();
        })
        .catch(function(err) {
          console.log('Error', err)
        });
    });
  });

  describe('When receiving messages', function () {

    it('should respond with an object containing the message ID', function (done) {
      const receivingParams = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        MaxNumberOfMessages: 10,
        VisibilityTimeout: 0,
        WaitTimeSeconds: 1
      };
      setupSQS.sqs.receiveMessage(receivingParams)
        .then(function(data) {
          console.log(Object.keys(data));
          expect(data.Messages).to.be.an('array');
          expect(data.Messages[0]).to.be.an('object');
          expect(data.Messages[0]).to.have.property('ReceiptHandle');
          receiptHandleForDeleteTest = data.Messages[0].ReceiptHandle;
          done();
        })
        .catch(function(err) {
          console.log(err, err.stack)
        });
    });
  });

  describe('When deleting a message', function () {
    it('should respond with an object containing the message ID', function (done) {
      const deleteParams = {
        QueueUrl: process.env.SQS_QUEUE_URL,
        ReceiptHandle: receiptHandleForDeleteTest
      };
      setupSQS.sqs.deleteMessage(deleteParams)
        .then(function(data) {
          expect(data.ResponseMetadata).to.be.an('object').with.property('RequestId');
          done();
        })
        .catch(function(err) {
          console.log(err, err.stack)
        });
    });
  });

}); // end tests for SQS 





