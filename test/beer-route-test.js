'use strict';

const expect = require('chai').expect;
const request = require('superagent');

const Beer = require('../model/beer.js');
const User = require('../model/user.js');
const Brewery = require('../model/brewery.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleBrewery = {
  name: 'the brewery name',
  address: 'the address',
  phoneNumber: '555-555-5555',
  timestamp: new Date()
};

// const newBrewery = {
//   name: 'new test brewery name',
//   address: 'new test address',
//   phoneNumber: '777-777-7777',
// };

const exampleBeer = {
  name: 'test beer',
  style: 'test style',
  ibu: '45',
  image: `${__dirname}/../data/tester.png`
};

describe('beer routes', function() {
  afterEach( done => {
    Promise.all([
      Beer.remove({}),
      Brewery.remove({}),
      User.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/brewery/:breweryID/beer', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => user.save())
        .then( user => {
          this.tempUser = user;
          return user.generateToken();
        })
        .then( token => {
          this.tempToken = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        exampleBrewery.userID = this.tempUser._id.toString();
        new Brewery(exampleBrewery).save()
        .then( brewery => {
          this.tempBrewery = brewery;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete exampleBrewery.userID;
        done();
      });

      it('should return a beer', done => {
        request.post(`${url}/api/brewery/${this.tempBrewery._id}/beer`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', exampleBeer.name)
        .field('style', exampleBeer.style)
        .field('ibu', exampleBeer.ibu)
        .attach('image', exampleBeer.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleBeer.name);
          expect(res.body.style).to.equal(exampleBeer.style);
          expect(res.body.ibu).to.equal(exampleBeer.ibu);
          expect(res.body.breweryID).to.equal(this.tempBrewery._id.toString());
          done();
        });
      });
    });
  });
});
