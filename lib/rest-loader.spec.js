'use strict';

var sinon = require('sinon');
var restLoader = require('./index');
var nock = require('nock');
var _ = require('lodash');

describe('REST Loader', function() {

  beforeEach(function() {

  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should throw an error if createUrl is not set in initialization', function() {
    (function() {
      restLoader();
    }).should.throw('invalid create url');
  });

  it('should throw an error if the data is not in the correct format', function() {
    (function() {
      var loader = restLoader('http://google.com');
      loader.load({});
    }).should.throw('no creation data supplied');
  });

  it('should reject if the response status code returns anything but 200', function(done) {
    nock('http://google.com')
      .post('/posturl')
      .once()
      .reply(300, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>');

    var loader = restLoader('http://google.com/posturl');
    loader.load({create: [{data: 'someData'}]})
      .then(null, function onError(err) {
        err.error.should.equal('STATUS_CODE_ERROR');
        done();
      });
  });

  it('should resolve even if there is no new data to create', function(done) {
    var loader = restLoader('http://google.com/posturl');
    loader.load({create:[]})
      .then(function(result) {
        result.length.should.equal(0);
        done();
      });
  });

  it('should resolve with all the data that got created', function(done) {
    nock('http://google.com')
      .post('/posturl')
      .thrice()
      .reply(200, 'data created!');

    var loader = restLoader('http://google.com/posturl');
    loader.load({
      create: [{
        data1: 'test'
      }, {
        data2: 'test'
      }, {
        data3: 'test'
      }]
    }).then(function(results) {
      results.length.should.equal(3);
      results[0].should.equal('data created!');
      results[1].should.equal('data created!');
      results[2].should.equal('data created!');
      done();
    });
  });
});
