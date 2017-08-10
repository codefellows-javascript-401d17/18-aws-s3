const request = require('superagent');
const expect = require('chai').expect;
const User = require('../model/user.js');
const Cabinet = require('../model/cabinet.js');
const Promise = require('bluebird');
const url = `http://localhost:${process.env.PORT}`;
const mongoose = require('mongoose');

const exampleUserBody = {
  username: 'exampleUser',
  password: '12345',
  email: 'exampleuser@gmail.com'
}

const exampleCabinetBody = {
  name: 'Esperanto',
};

describe('Cabinet Routes', function () {
  afterEach((done) => {
    Promise.all([
      User.remove(),
      Cabinet.remove()
    ])
      .then(() => { done() })
      .catch(done);
  });
  describe('POST /api/cabinet', function () {
    describe('provided a valid body', function () {
      //before: create a tempToken
      before((done) => {
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password) //from User model
          .then(user => {
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
      it('should return a cabinet', (done) => {
        request.post(`${url}/api/cabinet`)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .send(exampleCabinetBody)
          .end((err, rsp) => {
            if (err) console.error(err);
            expect(rsp.body.name).to.equal(exampleCabinetBody.name);
            expect(rsp.status).to.equal(200);
            done();
          })
      })
    })
    describe('provided an invalid body', function () {
      before((done) => {
        //user > user w/pass > token > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
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
      it('should return a 400 error', (done) => {
        request.post(`${url}/api/cabinet`)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .send({ notvalid: 'hahahaha' })
          .end((err, rsp) => {
            expect(rsp.status).to.equal(400);
            done();
          })
      })
    })
    describe('when request made with absent token', function () {
      it('responds with a 401 error', (done) => {
        request.post(`${url}/api/cabinet`)
          .send(exampleCabinetBody)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(401);
            done();
          })
      })
    })
  });
  describe('GET /api/cabinet/:id', function () {
    describe('when provided a valid id', function () {
      before((done) => {
        //saves hash-completed user document to collection
        //user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((userBody) => {
            return User.create(userBody);
          })
          .then((user) => {
            this.tempUser = user;
            return user.generateToken();
          })
          .then((token) => {
            this.tempToken = token;
            done();
          })
      })
      before((done) => {
        //add userID-complete cabinet to db, attach tempCabinet to context
        exampleCabinetBody.userID = this.tempUser._id.toString();
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            console.error(err);
            done();
          })

      })
      it('responds with a cabinet', (done) => {
        request.get(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .end((err, rsp) => {
            expect(rsp.body.name).to.equal('Esperanto');
            expect(rsp.status).to.equal(200);
            done();
          })
      })
    })
    describe('when provided no token', function () {
      //saves hash-completed user document to collection
      //user doc > tempToken
      before((done) => {
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((userBody) => {
            return User.create(userBody);
          })
          .then((user) => {
            this.tempUser = user;
            return user.generateToken();
          })
          .then((token) => {
            this.tempToken = token;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      //create userID-complete cabinet, add to db, attach cabinet to context
      before((done) => {
        exampleCabinetBody.userID = this.tempUser._id.toString();
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('responds with a 401 error', (done) => {
        request.get(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(401);
            done();
          })

      })
    })
  })
  describe('PUT /api/cabinet/:id', function () {
    //get user tempToken and a tempCabinet
    describe('when provided a valid id and body', function () {
      before((done) => {
        //create a hash-complete user, user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
            this.tempUser = user;
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
        //create a userID-completed cabinet to db, attach storedCabinet to context
        exampleCabinetBody.userID = this.tempUser._id;
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('should return a cabinet when provided a valid :id and body', (done) => {
        var updateCabinetBody = { name: 'Biology' };
        request.put(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .send(updateCabinetBody)
          .end((err, rsp) => {
            if (err) console.error(err);
            expect(rsp.status).to.equal(200);
            expect(rsp.body.name).to.equal('Biology');
            done();
          })
      })
    })
    describe('provided no token', function () {
      before((done) => {
        //create a hash-complete user, user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
            this.tempUser = user;
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
        //create a userID-completed cabinet to db, attach storedCabinet to context
        exampleCabinetBody.userID = this.tempUser._id;
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('responds with a 401 error', (done) => {
        var updateCabinetBody = { name: 'Biology' };
        request.put(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .send(updateCabinetBody)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(401);
            done()
          })
      })
    })
    describe('provided an invalid body', function () {
      before((done) => {
        //create a hash-complete user, user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
            this.tempUser = user;
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
        //create a userID-completed cabinet to db, attach storedCabinet to context
        exampleCabinetBody.userID = this.tempUser._id;
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('responds with a 400 error', (done) => {
        const updateCabinetBody = {};
        request.put(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .send(updateCabinetBody)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .end((err, rsp) => {
            expect(rsp.status).to.equal(400);
            done();
          })
      })
    })
  })
  describe('DELETE /api/cabinet/:id', function () {
    describe('when provided a valid id', function () {
      before((done) => {
        //create a hash-complete user, user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
            this.tempUser = user;
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
        //create a userID-completed cabinet to db, attach storedCabinet to context
        exampleCabinetBody.userID = this.tempUser._id;
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('responds with a 201 response', (done) => {
        request.delete(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .set({ Authorization: `Bearer ${this.tempToken}` })
          .end((err, rsp) => {
            expect(rsp.status).to.equal(201);
            done();
          })

      })
    })
    describe('not provided a valid token', function () {
      before((done) => {
        //create a hash-complete user, user doc > tempToken
        new User(exampleUserBody)
          .generatePasswordHash(exampleUserBody.password)
          .then((user) => {
            this.tempUser = user;
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
        //create a userID-completed cabinet to db, attach storedCabinet to context
        exampleCabinetBody.userID = this.tempUser._id;
        Cabinet.create(exampleCabinetBody)
          .then((cabinet) => {
            this.storedCabinet = cabinet;
            done();
          })
          .catch((err) => {
            next(err);
          })
      })
      it('responds with a 401 error', (done) => {
        request.delete(`${url}/api/cabinet/${this.storedCabinet._id}`)
          .end((err, rsp) => {
            expect(rsp.status).to.equal(401);
            done();
          })
      })
    })
  })
})
