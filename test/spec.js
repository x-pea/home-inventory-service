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
xdescribe('** Redis database **', function() {

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

describe('** mySQL database  **', function() {

  describe('After running the server, the airbnb database', function () {
    it('should exist', function (done) {
      createSQL.connection.queryAsync('SHOW DATABASES LIKE "airbnb"')
        .then(results => {
          expect(results[0]).to.exist;
          done();
        })
    });
    it('should have tables: cities, neighborhoods, hosts, homes', function (done) {
      createSQL.connection.queryAsync('SELECT table_name FROM information_schema.tables ' +
        'WHERE table_schema="airbnb"')
        .then(results => {
          let tables = {};
          results.forEach(item => tables[item.table_name] = 1);
          expect(tables['homes']).to.exist;
          expect(tables['cities']).to.exist;
          expect(tables['neighborhoods']).to.exist;
          expect(tables['hosts']).to.exist;
          done();
        })
    });
  });

  describe('The tables in the airbnb database', function () {

    it('should, for cities, include a name field', function (done) {
      createSQL.connection.queryAsync('SHOW COLUMNS FROM cities FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('name');
          done();
        })
    });
    it('should, for neighborhoods, include id_cities and name fields', function (done) {
      createSQL.connection.queryAsync('SHOW COLUMNS FROM neighborhoods FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('name');
          expect(results[2]['Field']).to.equal('id_cities');
          done();
        })
    });
    it('should, for hosts, include first_name and last_name fields', function (done) {
      createSQL.connection.queryAsync('SHOW COLUMNS FROM hosts FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('first_name');
          expect(results[2]['Field']).to.equal('last_name');
          done();
        })
    });
    it('should, for homes, include the fields: id_neighborhoods, id_cities, address, ' +
        'max_guests, price_usd, instant_book, photos, entire_home, ' +
        'private, parent_id, id_hosts', function (done) {
      createSQL.connection.queryAsync('SHOW COLUMNS FROM homes FROM airbnb')
        .then(results => {
          let fields = {};
          results.forEach(column => fields[column.Field] = 1);  
          let expectedFields = ['id_neighborhoods', 'id_cities', 'address',
            'max_guests', 'price_usd', 'instant_book', 'photos', 'entire_home',
            'private', 'parent_id', 'id_hosts']
          for (let f of expectedFields) { expect(fields[f]).to.equal(1); }
          done();
        })
    });
  });

  describe('The fake data', function () {

    describe('in the homes table', function () {

      it('should include an id_hosts that exists in the host table', function (done) {
        createSQL.connection.queryAsync('SELECT * FROM homes ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(createSQL.connection.queryAsync('SELECT * ' +
                'FROM hosts WHERE id = ?', [row.id_hosts]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      })
      it('should include an id_cities that exists in the cities table', function (done) {
        createSQL.connection.queryAsync('SELECT * FROM homes ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(createSQL.connection.queryAsync('SELECT * ' +
                'FROM cities WHERE id = ?', [row.id_cities]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      })
      it('should include an id_neighborhoods that exists in the neighborhoods table', function (done) {
        createSQL.connection.queryAsync('SELECT * FROM neighborhoods ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(createSQL.connection.queryAsync('SELECT * ' +
                'FROM cities WHERE id = ?', [row.id_neighborhoods]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      }) 

    }) // End tests for home table data

    describe('in the neighborhoods table', function () {

      it('should include an id_cities that exists in the cities table', function (done) {
        createSQL.connection.queryAsync('SELECT * FROM neighborhoods ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(createSQL.connection.queryAsync('SELECT * ' +
                'FROM cities WHERE id = ?', [row.id_cities]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      })

    }) // End tests for neighborhoods table data

    describe('for rooms inside other homes', function () {

      it('should include an appropriate parent_id that exists in the cities table', function (done) {
        let childRooms = [];
        createSQL.connection.queryAsync('SELECT * FROM homes WHERE parent_id IS NOT NULL ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            childRooms = rows;
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(createSQL.connection.queryAsync('SELECT * ' +
                'FROM homes WHERE id = ?', [row.parent_id]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            // console.log('Resolved rows: ', resolvedRows);
            expect(resolvedRows.length).to.equal(10);
            for (let i = 0; i < 10; i += 1) {
              let parentHome = resolvedRows[i][0];
              let childRoom = childRooms[i];
              expect(parentHome.id_cities).to.equal(childRoom.id_cities);
              expect(parentHome.address).to.equal(childRoom.address);
              expect(parentHome.id_hosts).to.equal(childRoom.id_hosts);
              expect(parentHome.parent_id).to.not.equal(childRoom.parent_id);
            }
            done();
          });      
      })

    }) // End tests for neighborhoods table data

  });

}); // end tests mySQL database

