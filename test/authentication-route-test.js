'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUserBody = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

describe('Auth Routes', function () {
  describe('POST: /api/signup', function () {
    describe('with a valid body', function () {
      after(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
          .send(exampleUserBody)
          .end((err, rsp) => {
            if (err) return done(err);
            console.log('POST: /api/signup TOKEN:', rsp.text, '\n');
            expect(rsp.status).to.equal(200);
            expect(rsp.text).to.be.a('string');
            done();
          });
      });
    });
    describe('with a missing body', function () {
      it('should return a 400 error', (done) => {
        request.post(`${url}/api/signup`)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(400);
            expect(rsp.text).to.equal('BadRequestError');
            done()
          })
      })
    })
    describe('with an invalid body', function () {
      it('should return a 400 error', (done) => {
        request.post(`${url}/api/signup`)
          .send({
            username: 'exampleuser',
            password: '1234' //missing required email
          })
          .end((err, rsp) => {
            expect(rsp.status).to.equal(400);
            expect(rsp.text).to.equal('BadRequestError');
            done()
          })
      })
    })
  });
  describe('GET /api/signin', function () {
    describe('with a valid auth header', function () {
      before(done => {
        let user = new User(exampleUserBody);
        user.generatePasswordHash(exampleUserBody.password)
          .then(user => user.save())
          .then(user => {
            this.tempUser = user;
            done();
          });
      });
      after(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
          .auth('exampleuser', '1234')
          .end((err, rsp) => {
            console.log('signed in user:', this.tempUser);
            console.log('GET: /api/signin TOKEN:', rsp.text);
            expect(rsp.status).to.equal(200);
            done();
          });
      });
    })
    describe('with invalid auth header', function () {
      before(done => {
        let user = new User(exampleUserBody);
        user.generatePasswordHash(exampleUserBody.password)
          .then(user => user.save())
          .then(user => {
            this.tempUser = user;
            done();
          });
      });
      after(done => {
        User.remove({})
          .then(() => done())
          .catch(done);
      });
      it('should return a token', done => {
        request.get(`${url}/api/signin`)
          .auth('naughtyuser', '4321')
          .end((err, rsp) => {
            expect(rsp.status).to.equal(401);
            done();
          });
      });
    });
  });
  describe('invalid endpoints', function () {
    describe('when given invalid endpoints', function () {
      it('responds with a 404 error', (done) => {
        request.get(`${url}/api/go_shopping`)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(404);
            done();
          });
      });
    });
  });
});
