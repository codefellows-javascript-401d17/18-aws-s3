'use strict';
const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Brewery = require('../model/brewery.js');
const Beer = require('../model/beer.js');

const url = `http://localhost:${process.env.PORT}`;

const exampleUser = {
  username: 'exampleuser',
  password: '1234',
  email: 'exampleuser@test.com'
};

let tempBrewery;

const exampleBrewery = {
  name: 'the brewery name',
  address: 'the address',
  phoneNumber: '555-555-5555',
  timestamp: new Date()
};

const exampleBeer = {
  name: 'test beer',
  style: 'test style',
  ibu: '45'
};

const newBrewery = {
  name: 'new test brewery name',
  address: 'new test address',
  phoneNumber: '777-777-7777',
};

describe('Brewery Routes', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Brewery.remove({}),
      Beer.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/brewery', function() {
    describe('POST with a valid req body',() => {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          return user.save();
        })
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
      it('should return a brewery 200', done => {
        request.post(`${url}/api/brewery`)
        .send(exampleBrewery)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err,res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.name).to.equal('the brewery name');
          expect(res.body.address).to.equal('the address');
          expect(res.body.phoneNumber).to.equal('555-555-5555');
          done();
        });
      });
    });
    describe('POST with an invalid request', () => {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          return user.save();
        })
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
      it('should return 400', done => {
        request.post(`${url}/api/brewery`)
        .send()
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err,res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
    describe('POST without a token 401', () => {
      before( done => {
        new User(exampleUser)
        .generatePasswordHash(exampleUser.password)
        .then( user => {
          return user.save();
        })
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
      it('should return 401', done => {
        request.post(`${url}/api/brewery`)
        .send()
        .end((err,res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('GET: /api/brewery/:id', () => {
    before( done => {
      new User(exampleUser)
      .generatePasswordHash(exampleUser.password)
      .then( user => {
        return user.save();
      })
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

    it('GET should return a brewery 200', done => {
      request.get(`${url}/api/brewery/${this.tempBrewery._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end( (err, res) => {
        if(err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.name).to.equal('the brewery name');
        expect(res.body.address).to.equal('the address');
        expect(res.body.phoneNumber).to.equal('555-555-5555');
        done();
      });
    });
    describe('GET with an invalid request 404', () => {
      it('should return 404', done => {
        request.get(`${url}/api/brewery/1231231231241413212`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end( (err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
      describe('GET with no token should be 401', () => {
        it('should return 401', done => {
          request.get(`${url}/api/brewery/1231231231241413212`)
          .end( (err, res) => {
            expect(res.status).to.equal(401);
            done();
          });
        });
      });

      describe('testing PUT /api/brewery/:id', () => {
        beforeEach( done => {
          new User(exampleUser)
          .generatePasswordHash(exampleUser.password)
          .then( user => {
            return user.save();
          })
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

        beforeEach( done => {
          exampleBrewery.userID = this.tempUser._id.toString();
          new Brewery(exampleBrewery).save()
          .then( brewery => {
            this.tempBrewery = brewery;
            done();
          })
          .catch(done);
        });

        it('PUT should respond with a 200 status code and an updated brewery object.', () => {
          return request.put(`${url}/api/brewery/${this.tempBrewery._id}`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send(newBrewery)
          .then(res => {
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal('new test brewery name');
            expect(res.body.address).to.equal('new test address');
            expect(res.body.phoneNumber).to.equal('777-777-7777');
            tempBrewery = res.body;
          });
        });
        it('PUT should respond with a 400 error code.', () => {
          return request.post(`${url}/api/brewery`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .send(tempBrewery)
          .then((res) => {
            tempBrewery = res.body;
            return request.put(`${url}/api/brewery/${this.tempBrewery._id}`)
            .set({
              Authorization: `Bearer ${this.tempToken}`
            })
            .send(null);
          })
          .catch(err => {
            expect(err.status).to.equal(400);
          });
        });
        it('PUT should respond with a 404 error code if an ID is not found.', () => {
          return request.put(`${url}/api/brewery/12345`)
          .set({
            Authorization: `Bearer ${this.tempToken}`
          })
          .catch(err => {
            expect(err.status).to.equal(404);
          });
        });
        it('PUT should respond with a 401 if no token was sent', () => {
          return request.put(`${url}/api/brewery/12345`)
          .catch(err => {
            expect(err.status).to.equal(401);
          });
        });
      });
    });
  });
});

describe('DELETE: /api/brewery/:id', () => {
  before( done => {
    new User(exampleUser)
    .generatePasswordHash(exampleUser.password)
    .then( user => {
      return user.save();
    })
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
    Promise.all([
      User.remove({}),
    ])
    .then( () => done())
    .catch(done);
  });

  it('DELETE should delete a brewery 204', done => {
    request.delete(`${url}/api/brewery/${this.tempBrewery._id}`)
    .set({
      Authorization: `Bearer ${this.tempToken}`
    })
    .end( (err, res) => {
      if(err) return done(err);
      expect(res.status).to.equal(204);
      done();
    });
  });
});
