'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('atlas:image-route-test');

const Image = require('../model/image.js');
const User = require('../model/user.js');
const Region = require('../model/region.js');

require('..server.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'example user',
  password: '1234',
  email: 'exampleuser@test.com'
}

const exampleRegion = {
  name: 'Opiuchi',
  capital: 'Geidi Prime',
  rulingHouse: 'Harkonnen'
}

const exampleImage = {
  name: 'example image',
  desc: 'example image description',
  image: `${__dirname}/../data/test.png`
}

describe('Image Routes', function() {
  afterEach(done => {
    Promise.all([
      Image.remove({}),
      User.remove({}),
      Region.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/region/:regionID/image', function() {
    describe('with a valid token and data', function() {
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
        exampleRegion.userID = this.tempUser._id.toString();
        new Region(exampleRegion).save()
        .then(region => {
          this.tempRegion = region;
          done();
        })
        .catch(done);
      });

      after(done => {
        delete exampleRegion.userID;
        done();
      });

      it('should return an image', done => {
        request.post(`${url}/api/region/${this.tempRegion._id}/image`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .field('name', exampleImage.name)
        .field('desc', exampleImage.desc)
        .attach('image', exampleImage.image)
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal(exampleImage.name);
          expect(res.body.desc).to.equal(exampleImage.desc);
          expect(res.body.regionID).to.equal(this.tempRegion._id.toString());
          done();
        });
      });
    });
  });
});
