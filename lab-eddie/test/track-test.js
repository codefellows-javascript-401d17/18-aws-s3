'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('app:track-route-test');

const Track = require('../model/track.js');
const User = require('../model/user.js');
const Album = require('../model/album.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`
User.remove({})
const testUser = {
  userName: 'Lucifer',
  passWord: '666666',
  email: 'satan@hell.com'
}

const testAlbum = {
  title: 'Title',
  datePublished: new Date()
}

const testTrack = {
  title: 'I like cheese',
  track: `${__dirname}/../data/test.mp3`
}

describe('track Routes', function() {
  afterEach( done => {
    Promise.all([
      Track.remove({}),
      User.remove({}),
      Album.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/album/:AlbumID/track', function() {
    describe('with a valid token and valid data', function() {
      before( done => {
        new User(testUser)
        .hashPass(testUser.passWord)
        .then( user => user.save())
        .then( user => {
          this.user = user;
          return user.signToken();
        })
        .then( token => {
          this.token = token;
          done();
        })
        .catch(done);
      });

      before( done => {
        testAlbum.userID = this.user._id.toString();
        new Album(testAlbum).save()
        .then( album => {
          this.album = album;
          done();
        })
        .catch(done);
      });

      after( done => {
        delete testAlbum.userID;
        done();
      });

      it('should return a track', done => {
        request.post(`${url}/api/album/${this.album._id}/track`)
        .set({
          Authorization: `Bearer ${this.token}`
        })
        .field('title', testTrack.title)
        .attach('track', testTrack.track)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          console.log(res.body)
          done();
        });
      });
    });
  });
});