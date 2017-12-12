/* eslint-disable */

import { config } from 'dotenv';
import Promise from 'bluebird';
import * as mysql from 'mysql';
import redis from 'redis';
import client from '../database/redis.js';
import { expect } from 'chai';
import * as createSQL from '../database/createSQL';
import * as seedSQL from '../database/seedSQL';
import server from '../server/index.js';
import AWS from 'aws-sdk';
import sqs from '../server/setupSQS.js';
import supertest from 'supertest';

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

xdescribe('** AWS SQS **', function() {

  // Use this for the delete test later
  var receiptHandleForDeleteTest;

  describe('When sending a message', function () {
    it('should respond with an object containing the message ID', function (done) {
      const sendingParams = {
        DelaySeconds: 0,
        MessageAttributes: {
          Greeting: {
            DataType: 'String',
            StringValue: 'Hello, Tester!'
          }
        },
        MessageBody: 'A sample message to test SQS',
        QueueUrl: process.env.SQS_TESTQUEUE_URL
      };
      sqs.sendMessage(sendingParams)
        .then(function(data) {
          expect(data.MessageId).to.be.a('string');
          done();
        })
        .catch(function(err) {
          done(err);
        });
    });
  });

  describe('When receiving messages', function () {

    it('should respond with an object containing the message ID', function (done) {
      const receivingParams = {
        QueueUrl: process.env.SQS_TESTQUEUE_URL,
        MaxNumberOfMessages: 10,
        // VisibilityTimeout: 10, // set in GUI!
        // WaitTimeSeconds: 1 // set in GUI!
      };
      sqs.receiveMessage(receivingParams)
        .then(function(data) {
          console.log(data);
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
        QueueUrl: process.env.SQS_TESTQUEUE_URL,
        ReceiptHandle: receiptHandleForDeleteTest
      };
      sqs.deleteMessage(deleteParams)
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

// Redis must already be running for this to work
describe('** Redis database **', function() {

  describe('The set method', function () {
    it('should set a value for a key', function (done) {
      client.setAsync('potato', 'trump')
        .then(reply => {
          console.log(reply.toString());
          expect(reply).to.equal('OK');
          done();
        })
        .catch(err => {
          console.log('Error setting value for a key: ', err);
          done();
        });
    });
  });

  describe('The get method', function () {
    it('should get the value of a key', function (done) {
      client.getAsync('potato')
        .then(reply => {
          expect(reply).to.equal('trump');
          done();
        })
        .catch(err => {
          console.log('Error getting value for a key: ', err);
          done();
        });
    });
  });

  describe('The del (delete) method', function () {
    it('should delete a key and value from redis', function (done) {
      client.delAsync('potato')
        .then(() => client.getAsync('potato'))
        .then(reply => {
          console.log(reply);
          expect(reply).to.equal(null);
          done();
        })
        .catch(err => {
          console.log('Error deleting from Redis: ', err);
          done();
        });
    });
  });
  
  describe('The hmset method', function () {
    it('should use a hash to store key / value pairs', function (done) {
      client.hmsetAsync('myhash', 'username', 'trump', 'password', 'breitbart')
        .then(reply => {
          expect(reply).to.equal('OK');
          return client.hmgetAsync('myhash', 'password', 'username')
        })
        .then(reply => {
          expect(reply).to.eql(['breitbart', 'trump']);
          client.quit();
          done();
        })     
        .catch(err => {
          console.log('Error using hmset with Redis: ', err);
          client.quit();
          done();
        });
    });
  });

}); // end tests for Redis database



