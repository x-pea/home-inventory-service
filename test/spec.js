require('dotenv').config();
const mysql = require('mysql');
const expect = require('chai').expect;
const createSQL = require('../database/createSQL.js');
const seedSQL = require('../database/seedSQL.js');
const server = require('../server/index.js');
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
        .then(() => done())
    });
  });


});