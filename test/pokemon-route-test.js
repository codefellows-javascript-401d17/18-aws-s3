'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Pokemon = require('../model/pokemon.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleruser',
  password: '12345',
  email: 'example@test.com'
};

const examplePokemon = {
  name: 'example name',
  type: 'example type',
  gen: 'example gen'
};

describe('Pokemon Routes', function() {
  afterEach(done => {
    Promise.all([
      User.remove({}),
      Pokemon.remove({})
    ])
    .then(() => done())
    .catch(done);
  });

  describe('POST: /api/pokemon', () => {
    beforeEach(done => {
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

    it('should return a pokemon', done => {
      request.post(`${url}/api/pokemon`)
      .send(examplePokemon)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.name).to.equal(examplePokemon.name);
        expect(res.body.type).to.equal(examplePokemon.type);
        expect(res.body.gen).to.equal(examplePokemon.gen);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        done();
      });
    });

    it('should return 401', done => {
      request.post(`${url}/api/pokemon`)
      .send(examplePokemon)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return 400', done => {
      request.post(`${url}/api/pokemon`)
      .send({ name: 'fakename', type: 'faketype' })
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('GET: /api/pokemon/:id', () => {
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
      examplePokemon.userID = this.tempUser._id.toString();
      new Pokemon(examplePokemon).save()
      .then(pokemon => {
        this.tempPokemon = pokemon;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete examplePokemon.userID;
    });

    it('should return a pokemon', done => {
      request.get(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.body.name).to.equal(examplePokemon.name);
        expect(res.body.type).to.equal(examplePokemon.type);
        expect(res.body.gen).to.equal(examplePokemon.gen);
        expect(res.body.userID).to.equal(this.tempUser._id.toString());
        done();
      });
    });

    it('should return 404', done => {
      request.get(`${url}/api/pokemon`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should return 401', done => {
      request.get(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
  });

  describe('PUT: /api/pokemon/:id', function() {
    beforeEach(done => {
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

    beforeEach(done => {
      examplePokemon.userID = this.tempUser._id.toString();
      new Pokemon(examplePokemon).save()
      .then(pokemon => {
        this.tempPokemon = pokemon;
        done();
      })
      .catch(done);
    });

    after(() => {
      delete examplePokemon.userID;
    });

    it('should return a pokemon', done => {
      request.put(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .send({ name: 'new pokemon name' })
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('new pokemon name');
        done();
      });
    });

    it('should return 404', done => {
      request.put(`${url}/api/pokemon`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should return 401', done => {
      request.put(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });

    it('should return 400', done => {
      request.post(`${url}/api/pokemon`)
      .send({ name: 'fakename', type: 'faketype' })
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
    });
  });

  describe('DELETE: /api/pokemon/:id', function() {
    beforeEach(done => {
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

    beforeEach(done => {
      examplePokemon.userID = this.tempUser._id.toString();
      new Pokemon(examplePokemon).save()
      .then(pokemon => {
        this.tempPokemon = pokemon;
        done();
      })
      .catch(done);
    });

    it('should return 204', done => {
      request.delete(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(204);
        done();
      });
    });

    it('should return 404', done => {
      request.delete(`${url}/api/pokemon`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should return 401', done => {
      request.delete(`${url}/api/pokemon/${this.tempPokemon._id}`)
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
    });
  });
});