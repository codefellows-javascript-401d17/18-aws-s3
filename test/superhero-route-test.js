'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');
const mongoose = require('mongoose');

const User = require('../model/user.js');
const Superhero = require('../model/superhero.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

const exampleSuperhero = {
  name: 'test superhero',
  powers: 'test powers',
};

describe('Superhero Routes', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Superhero.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/superhero', () => {
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

    it('should return a superhero', done => {
      request.post(`${url}/api/superhero`)
      .send(exampleSuperhero)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(exampleSuperhero.name);
        expect(res.body.powers).to.equal(exampleSuperhero.powers);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return unauthorized', done => {
      request.post(`${url}/api/superhero`)
      .send(exampleSuperhero)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return a bad request', done => {
      request.post(`${url}/api/superhero`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('GET: /api/superhero/:id', () => {
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
      exampleSuperhero.userID = this.tempUser._id.toString();
      new Superhero(exampleSuperhero).save()
      .then( superhero => {
        this.tempSuperhero = superhero;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleSuperhero.userID;
    });

    it('should return a superhero', done => {
      request.get(`${url}/api/superhero/${this.tempSuperhero._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        let date = new Date(res.body.created).toString();
        expect(res.body.name).to.equal(exampleSuperhero.name);
        expect(res.body.powers).to.equal(exampleSuperhero.powers);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        expect(date).to.not.equal('Invalid Date');
        done();
      });
    });

    it('should return unauthorized', done => {
      request.get(`${url}/api/superhero/${this.tempSuperhero._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return id not found', done => {
      request.get(`${url}/api/superhero/`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('PUT: /api/superhero/:id', () => {
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
      exampleSuperhero.userID = this.tempUser._id.toString();
      new Superhero(exampleSuperhero).save()
      .then( superhero => {
        this.tempSuperhero = superhero;
        done();
      })
      .catch(done);
    });

    after( () => {
      delete exampleSuperhero.userID;
    });

    it('should return an updated superhero', done => {
      var updated = { name: 'updated name' };

      request.put(`${url}/api/superhero/${this.tempSuperhero._id}`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal(updated.name);
        done();
      });
    });

    it('should return a bad request', done => {
      var updated = { color: 'blue' };

      request.put(`${url}/api/superhero/${this.tempSuperhero._id}`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should return unauthorized', done => {
      var updated = { name: 'updated name' };

      request.put(`${url}/api/superhero/${this.tempSuperhero._id}`)
      .send(updated)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return id not found', done => {
      var updated = { name: 'updated name' };

      request.put(`${url}/api/superhero/`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });
});
