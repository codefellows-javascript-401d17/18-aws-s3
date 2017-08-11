'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '12345',
  email: 'example@test.com'
};

describe('Auth Routes', function() {

  describe('POST: /api/signup', function() {
    describe('with a valid body', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.post(`${url}/api/signup`)
        .send(exampleUser)
        .end((err, res) => {
          if(err) return done(err);
          console.log('POST /api/signup TOKEN:', res.text, '\n');
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid request', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 400', done => {
        request.post(`${url}/api/signup`)
        .send({username: 'fake user', password: '123fake'})
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an invalid route', function() {
      after( done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 404', done => {
        request.post(`${url}/api/signdown`)
        .send(exampleUser)
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('GET: /api/signin', function() {
    describe('with a valid body', function() {
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        });
      });

      after(done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return a token', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', '12345')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });

    describe('with an invalid password', function() {
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        });
      });

      after(done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 401', done => {
        request.get(`${url}/api/signin`)
        .auth('exampleuser', '54321')
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an invalid route', function() {
      before(done => {
        let user = new User(exampleUser);
        user.generatePasswordHash(exampleUser.password)
        .then(user => user.save())
        .then(user => {
          this.tempUser = user;
          done();
        });
      });

      after(done => {
        User.remove({})
        .then( () => done())
        .catch(done);
      });

      it('should return 401', done => {
        request.get(`${url}/api/signout`)
        .auth('exampleuser', '12345')
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
