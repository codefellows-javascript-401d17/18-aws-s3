'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const debug = require('debug')('userex:pic-route-test');

const Pic = require('../model/pic.js');
const User = require('../model/user.js');
const Comment = require('../model/comment.js');

require('../server.js');

const url = `http://localhost:${process.env.PORT}`

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
}

const exampleComment = {
  name: 'test comment',
  desc: 'test comment description'
};

const examplePic = {
  name: 'example pic',
  desc: 'example pic description',
  image: `${__dirname}/../data/tester.png`
};

describe('Pic Routes', function() {
  afterEach(done => {
    Promise.all([
        Pic.remove({}),
        User.remove({}),
        Comment.remove({})
      ])
      .then(() => done())
      .catch(done);
  });

  describe('POST: /api/comment/:commentID/pic', function() {
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
        exampleComment.userID = this.tempUser._id.toString();
        new Comment(exampleComment).save()
          .then(comment => {
            this.tempComment = comment;
            done();
          })
          .catch(done);
      });

      after(done => {
        delete exampleComment.userID;
        done();
      });

      it('should return a pic', done => {
        request.post(`${url}/api/comment/${this.tempComment._id}/pic`)
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
            expect(res.body.commentID).to.equal(this.tempComment._id.toString());
            done();
          })
          .catch(done());
      });
    });
  });
});