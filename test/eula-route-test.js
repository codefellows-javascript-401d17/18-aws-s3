'use strict';
const expect = require('chai').expect;
const request = require('superagent');
const User = require('../model/user.js');
const Cabinet = require('../model/cabinet.js');
const Eula = require('../model/eula.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUserBody = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleCabinetBody = {
  name: 'Internet',
}

const exampleEulaBody = {
  name: 'Google EULA',
  content: 'some really long string of legalese',
  image: `${__dirname}/../data/test.jpg`
}

describe('Eula Routes', function () {
  afterEach((done) => {
    Promise.all([
      User.remove(),
      Cabinet.remove(),
      Eula.remove()
    ])
      .then(() => {
        done();
      })
      .catch((err) => {
        done(err);
      })
  })
  describe('with a valid token and token data', function () {
    before((done) => {
      new User(exampleUserBody)
        .generatePasswordHash(exampleUserBody.password)
        .then((user) => {
          return User.create(user)
        })
        .then((user) => {
          this.storedUser = user;
          return user.generateToken();
        })
        .then((token) => {
          this.tempToken = token;
          done();
        })
        .catch((err) => {
          done(err);
        })
    })
    before((done) => {
      exampleCabinetBody.userID = this.storedUser._id.toString();
      Cabinet.create(exampleCabinetBody)
        .then((cabinet) => {
          this.storedCabinet = cabinet;
          done();
        })
        .catch((err) => {
          done(err);
        })
    })
    it('responds with a eula', (done) => {
      request.post(`${url}/api/cabinet/${this.storedCabinet._id}/eula`)
        .set({ Authorization: `Bearer ${this.tempToken}` })
        .field('name', exampleEulaBody.name)
        .field('content', exampleEulaBody.content)
        .attach('image', exampleEulaBody.image)
        .end((err, rsp) => {
          if (err) return done(err);
          expect(rsp.status).to.equal(200);
          expect(rsp.body.name).to.equal(exampleEulaBody.name);
          expect(rsp.body.content).to.equal(exampleEulaBody.content)
          expect(rsp.body.cabinetID).to.equal(this.storedCabinet._id.toString());
          done();
        })
    })
  })
})
