'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('cfgram:pic-route-test');

const Pic = require('../model/pic.js');
const User = require('../model/user.js');
const Superhero = require('../model/superhero.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleUser',
  password: '1234',
  email: 'exampleuser@test.com'
}

const exampleSuperhero = {
  name: 'test name',
  powers: 'test powers'
}

const examplePic = {
  name: 'example pic',
  desc: 'example pic description',
  image: `${__dirname}/../data/tester.png`
}

describe('Pic Routes', function() {
  afterEach( done => {
    Promise.all([
      Pic.remove({}),
      User.remove({}),
      Superhero.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/superhero/:superheroID/pic', function() {
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
        exampleSuperhero.userID = this.tempUser._idtoString();
        new Superhero(exampleSuperhero).save()
        .then( superhero => {
          this.tempSuperhero = superhero;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete exampleSuperhero.userID;
        done();
      });

      it('should return a pic', done => {
        request.post(`${url}/api/superhero/${this.tempSuperhero._id}/pic`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', examplePic.name)
        .field('desc', examplePic.desc)
        .attach('image', examplePic.image)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(examplePic.name);
          expect(res.body.desc).to.equal(examplePic.desc);
          expect(res.body.superheroID).to.equal(this.tempSuperhero._id.toString());
          done();
        });
      });
    });
  });
});
