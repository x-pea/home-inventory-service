/* eslint-disable */

import {} from 'dotenv/config';
import Promise from 'bluebird';
import * as mysql from 'mysql';
// import redis from 'redis';
import client from '../database/redis.js';
import { expect } from 'chai';
import sql from '../database/index';
import server from '../server/index.js';
import AWS from 'aws-sdk';
import sqs from '../server/setupSQS.js';
import { handleResMess, queueFromReservations } from '../server/handleSQS';
import supertest from 'supertest';
import sinon from 'sinon';


const testRequest = supertest.agent(server);
sinon.config = { useFakeTimers: false };

describe('** Node / Express server **', function() {

  describe('The GET / route', function () {
    it('should respond with status code 200', function (done) {
      testRequest
        .get('/')
        .expect(200)
        .then(() => done());
    });
  });

  describe('The GET /homes?:id route', function () {
    it('should query the database for details of the home', function (done) {
      client.del('999999');
      const dbQuery = sinon.stub(sql, 'queryAsync');
      dbQuery.returns(Promise.resolve([{ id: 999999 }]));
      testRequest
        .get('/homes?id=999999')
        .expect(200, { id: 999999 })
        .then(() => {
          dbQuery.restore();
          return client.delAsync('999999');
        })
        .then(() => done());
    });
  });  

}); // end tests for Node / Express server


describe('** mySQL database  **', function() {

  describe('After running the server, the airbnb database', function () {
    it('should exist', function (done) {
      sql.queryAsync('SHOW DATABASES LIKE "airbnb"')
        .then(results => {
          expect(results[0]).to.exist;
          done();
        })
    });
    it('should have tables: cities, neighborhoods, hosts, homes', function (done) {
      sql.queryAsync('SELECT table_name FROM information_schema.tables ' +
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
      sql.queryAsync('SHOW COLUMNS FROM cities FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('name');
          done();
        })
    });
    it('should, for neighborhoods, include id_cities and name fields', function (done) {
      sql.queryAsync('SHOW COLUMNS FROM neighborhoods FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('name');
          expect(results[2]['Field']).to.equal('id_cities');
          done();
        })
    });
    it('should, for hosts, include first_name and last_name fields', function (done) {
      sql.queryAsync('SHOW COLUMNS FROM hosts FROM airbnb')
        .then(results => {
          expect(results[1]['Field']).to.equal('first_name');
          expect(results[2]['Field']).to.equal('last_name');
          done();
        })
    });
    it('should, for homes, include the fields: id_neighborhoods, id_cities, address, ' +
        'max_guests, price_usd, instant_book, photos, entire_home, ' +
        'private, parent_id, id_hosts', function (done) {
      sql.queryAsync('SHOW COLUMNS FROM homes FROM airbnb')
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
        sql.queryAsync('SELECT * FROM airbnb.homes ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(sql.queryAsync('SELECT * FROM airbnb.hosts ' +
                'WHERE id = ?', [row.id_hosts]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      })
      it('should include an id_cities that exists in the cities table', function (done) {
        sql.queryAsync('SELECT * FROM airbnb.homes ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(sql.queryAsync('SELECT * FROM airbnb.cities ' +
                'WHERE id = ?', [row.id_cities]))
            });
            return Promise.all(testPromises)
          })
          .then(resolvedRows => {
            expect(resolvedRows.length).to.equal(10);
            done();
          });      
      })
      it('should include an id_neighborhoods that exists in the neighborhoods table', function (done) {
        sql.queryAsync('SELECT * FROM airbnb.neighborhoods ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(sql.queryAsync('SELECT * FROM airbnb.cities ' +
                'WHERE id = ?', [row.id_neighborhoods]))
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
        sql.queryAsync('SELECT * FROM airbnb.neighborhoods ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(sql.queryAsync('SELECT * FROM airbnb.cities ' +
                'WHERE id = ?', [row.id_cities]))
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
        sql.queryAsync('SELECT * FROM airbnb.homes WHERE parent_id IS NOT NULL ' +
          'ORDER BY RAND() LIMIT 10')
          .then(rows => {
            childRooms = rows;
            let testPromises = [];
            rows.forEach(row => {
              testPromises.push(sql.queryAsync('SELECT * ' +
                'FROM airbnb.homes WHERE id = ?', [row.parent_id]))
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


describe('** Server / database integration **', function() {

  describe('The GET /homes?:id route', function () {
    it('should return the details of the home from the database', function (done) {
      let expectedHome = {};
      sql.queryAsync('SELECT id FROM airbnb.cities ORDER BY id DESC LIMIT 1')
        .tap(rows => expectedHome = rows[0])
        .then(rows => testRequest
          .get(`/homes?id=${rows[0].id}`)
          .expect(200)
          .then(response => {
            expect(response.id, rows[0].id);
            expect(response.address, rows[0].address);
          })
          .then(() => done())
        )
    });
  });

  describe('The POST /homes route', function () {
    it('should create a new home in the database', function (done) {
      let postedHome = { id_neighborhoods: 1, id_cities: 1, address: '11 First Avenue',
        id_hosts: 1, max_guests: 1, price_usd: 999, instant_book: 0, entire_home: 1,
        private: 1, parent_id: null, photos: 'http://www.image.com/abcde'
      };
      testRequest // should be using airbnb_test database!!!
        .post('/homes')
        .send(postedHome)
        .expect(201)
        .expect(response => {
          if (!response.body.id) {
            throw new Error("Id was not returned");
          }
        })
        .then(() => done())
    });
  });    


  describe('The PATCH /homes route', function () {
    it('should update a home in the database', function (done) {
      sql.queryAsync('SELECT * FROM airbnb_test.homes ORDER BY id DESC LIMIT 1')
        .then(rows => {
          const updatedHome = rows[0];
          updatedHome.address = '12345 Update Street';
          testRequest
            .patch('/homes')
            .send(updatedHome)          
            .expect(201)
            .expect(response => {
              if (response.body.address !== '12345 Update Street') {
                throw new Error("Home was not updated");
              }
              return sql.queryAsync('UPDATE airbnb_test.homes SET ? WHERE id = ?',
                [{ address: '54321 Old Street' }, updatedHome.id]);
            })
            .then(() => done());
        })        
    });
  }); 

}); // end tests for Node / Express server


describe('** AWS SQS **', function() {

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

  describe('When handling a message in the reservations queue', function () {

    // Set up for the SQS consumer tests
    let sendingParams;

    before(function() {
      sendingParams = {
        DelaySeconds: 0,
        MessageBody: JSON.stringify({ 
          dateAvailability: { '3': [1, 2, 1, 12, 3, 5, 5, 7] },
          rental: 5 
        }),
        QueueUrl: process.env.SQS_QUEUE_URL2
      }; 
    });

    it('should invoke the consumer method \'handleMessage\' and custom \'handleResMess\'', function (done) {

      const handlerSpy = sinon.spy(queueFromReservations, 'handleMessage');
      const handlerSpy2 = sinon.spy(handleResMess);

      sql.queryAsync('INSERT INTO airbnb_test.reservations SET ?', [{ date: '1111-11-11', homes_id: 5 }])
        .then(() => sqs.sendMessage(sendingParams))
        .then(() => {
          const waitCheck = () => {
            expect(handlerSpy.called).to.be.true;
            expect(handlerSpy2.called).to.be.true;
          }; 
          setTimeout(waitCheck, 1500);
        })
        .then(() => {
          queueFromReservations.handleMessage.restore();
          done();
        })
        .catch(err => done(err));
    });

  });

}); // end tests for SQS 

// Redis must already be running for this to work
describe('** Redis database **', function() {

  describe('The set method', function () {
    it('should set a value for a key', function (done) {
      client.setAsync('potato', 'chip')
        .then(reply => {
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
          expect(reply).to.equal('chip');
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
      client.hmsetAsync('myhash', 'username', 'potato', 'password', 'chip')
        .then(reply => {
          expect(reply).to.equal('OK');
          return client.hmgetAsync('myhash', 'password', 'username')
        })
        .then(reply => {
          expect(reply).to.eql(['chip', 'potato']);
          done();
        })     
        .catch(err => {
          console.log('Error using hmset with Redis: ', err);
          // client.quit();
          done();
        });
    });
  });

}); // end tests for Redis database


// Redis must already be running for this to work
describe('** Server / Redis integration **', function() {
  
  describe('The GET /homes?:id route', function () {
    it('should return home details from Redis if available', function (done) {
      sql.queryAsync('DELETE FROM homes WHERE id = 999999')
        .then(() => client.setAsync('999999', JSON.stringify({ 
          id_neighborhoods: 1, id_cities: 1, address: '11 First Avenue',
          id_hosts: 1, max_guests: 1, price_usd: 999, instant_book: 0, entire_home: 1,
          private: 1, parent_id: null, photos: 'http://www.image.com/abcde'
        })))
        .then(() => testRequest
          .get('/homes?id=999999')
          .expect(200)
          .then(response => {
            expect(response.id, 999999);
            expect(response.address, '11 First Avenue');
          })
        )
        .then(() => client.delAsync('999999'))
        .then(() => done())
    });
  });

  describe('The POST /homes route', function () {
    it('should create a new home in Redis', function (done) {
      let postedHome = { id_neighborhoods: 1, id_cities: 1, address: '11 First Avenue',
        id_hosts: 1, max_guests: 1, price_usd: 999, instant_book: 0, entire_home: 1,
        private: 1, parent_id: null, photos: 'http://www.image.com/abcde'
      };
      let testId;
      testRequest // should be using airbnb_test database!!!
        .post('/homes')
        .send(postedHome)
        .expect(201)
        .expect(response => {
          if (!response.body.id) {
            throw new Error("Id was not returned");
          }
          testId = response.body.id;
          return Promise.resolve(true);
        })
        .then(() => client.getAsync(testId))
        .then(reply => expect(JSON.parse(reply).address).to.equal('11 First Avenue'))
        .then(() => client.delAsync(testId))
        .then(() => sql.queryAsync('DELETE FROM homes WHERE id = ?', [testId]))
        .then(() => done())
    });
  });    

  describe('The PATCH /homes route', function () {
    it('should update a home in Redis', function (done) {
      let updatedHome;
      sql.queryAsync('SELECT * FROM airbnb_test.homes ORDER BY id DESC LIMIT 1')
        .then(rows => {
          updatedHome = Object.assign({}, rows[0]);
          updatedHome.address = '12345 Update Street';
          testRequest
            .patch('/homes')
            .send(updatedHome)          
            .expect(201)
            .then(() => client.getAsync(updatedHome.id))
            .then(reply => expect(JSON.parse(reply).address).to.equal('12345 Update Street'))
            .then(() => client.delAsync(updatedHome.id))
            .then(() => sql.queryAsync('UPDATE homes SET ? WHERE id = ?', 
              [{address: '11 First Avenue'}, updatedHome.id])
            )
            .then(() => done());
        })        
    });
  });

}); // end tests for Redis integration

