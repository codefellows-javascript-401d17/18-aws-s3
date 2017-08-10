'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const User = require('../model/user.js');
const Region = require('../model/region.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'example user',
  password: '1234',
  email: 'exampleuser@test.com'
}

const exampleRegion = {
  name: 'Delta Pavonis',
  capital: 'Caladan',
  rulingHouse: 'Atreides'
}

describe('Region Routes', function() {
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Region.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /app/region', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    if('should return a region', done => {
      request.post(`${url}/api/region`)
      .send(exampleRegion)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleRegion.name);
        expect(res.body.capital).to.equal(exampleRegion.capital);
        expect(res.body.rulingHouse).to.equal(exampleRegion.rulingHouse);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        done();
      });
    });
  });

  describe('GET: /api/region/:id', () => {
    before(done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then(user => user.save())
      .then(user => {
        this.tempUser = user;
        return user.generateToken()
      })
      .then(token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    before(done => {
      exampleRegion.userID = this.tempUser._id.toString();
      new Region(exampleRegion).save()
      .then(region => {
        this.tempRegion = region;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete exampleRegion.userID;
    });

    it('should return a region', done => {
      request.get(`${url}/api/region/${this.tempRegion._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(exampleRegion.name);
        expect(res.body.capital).to.equal(exampleRegion.capital);
        expect(res.body.rulingHouse).to.equal(exampleRegion.rulingHouse);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        done();
      });
    });
  });
});
