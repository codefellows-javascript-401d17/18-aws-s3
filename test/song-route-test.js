'use strict';

const expect = require('chai').expect;
const request = require('superagent');

const Song = require('../model/song.js');
const User = require('../model/user.js');
const Band = require('../model/band.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser ={
  username: 'exampleuser',
  password: '12345',
  email: 'example@test.com'
};

const exampleBand = {
  name: 'test band',
  genre: 'test genre',
  origin: 'test origin'
};

const exampleSong =  {
  name: 'example song name',
  year: 'example song year',
  audio: `${__dirname}/../data/test.mp3`
};

describe('Song Routes', function() {
  afterEach(done => {
    Promise.all([
      Song.remove({}),
      Band.remove({}),
      User.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/band/:bandID/song', function() {
    describe('with a valid token and valid data', function() {
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

      before(done => {
        exampleBand.userID =
        this.tempUser._id.toString();
        new Band(exampleBand).save()
        .then(band => {
          this.tempBand = band;
          done();
        })
        .catch(done);
      });

      after(done => {
        delete exampleBand.userID;
        done();
      });

      it('should return a song', done => {
        request.post(`${url}/api/band/${this.tempBand._id}/song`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', exampleSong.name)
        .field('year', exampleSong.year)
        .attach('audio', exampleSong.audio)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleSong.name);
          expect(res.body.year).to.equal(exampleSong.year);
          expect(res.body.bandID).to.equal(this.tempBand._id.toString());
          done();
        });
      });
    });
  });
});
