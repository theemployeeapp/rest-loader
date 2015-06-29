'use strict';

var sinon = require('sinon');
var restLoader = require('./index');
var nock = require('nock');
var _ = require('lodash');

var baseOptions = {
  protocol: 'https',
  host: 'appv2.theirapp.com',
  pathname: '/content',
  query: {
    access_token: 'someToken'
  }
};

describe('REST Loader', function() {
  var options;
  beforeEach(function() {
    options = _.assign({}, baseOptions);
  });

  afterEach(function() {
    nock.cleanAll();
  });

  it('should not throw an error if all initialization options are present', function() {
    (function() {
      restLoader(options);
    }).should.not.throw('host, protocol, and pathname are required');
  });

  it('should throw an error if the host is not supplied in the options', function() {
    (function() {
      restLoader(_.omit(options, 'host'));
    }).should.throw('host, protocol, and pathname are required');
  });

  it('should throw an error if the protocol is not supplied in the options', function() {
    (function() {
      restLoader(_.omit(options, 'protocol'));
    }).should.throw('host, protocol, and pathname are required');
  });

  it('should throw an error if the pathname is not supplied in the options', function() {
    (function() {
      restLoader(_.omit(options, 'pathname'));
    }).should.throw('host, protocol, and pathname are required');
  });

  it('should throw an error if the data is not in the correct format', function() {
    (function() {
      var loader = restLoader(options);
      loader.load({});
    }).should.throw('no creation data supplied');
  });

  it('should reject if the response status code returns anything but 200', function(done) {
    nock('http://google.com')
      .post('/posturl')
      .once()
      .reply(300, '<?xml version="1.0"?><test><data><deep><data>test</data></deep></data></test>');

    var loader = restLoader({
      host: 'google.com',
      protocol: 'http',
      pathname: 'posturl',
    });
    loader.load({create: [{data: 'someData'}]})
      .then(null, function onError(err) {
        err.error.should.equal('STATUS_CODE_ERROR');
        done();
      });
  });

  it('should resolve with all the data that got created', function(done) {
    nock('http://google.com')
      .post('/posturl')
      .thrice()
      .reply(200, 'data created!');

    var loader = restLoader({
      host: 'google.com',
      protocol: 'http',
      pathname: 'posturl'
    });
    loader.load({
      create: [{
        _id: '1111',
        data1: 'test'
      }, {
        _id: '2222',
        data2: 'test'
      }, {
        _id: '3333',
        data3: 'test'
      }]
    }).then(function(results) {
      results.createResults.length.should.equal(3);
      results.createResults[0].should.equal('data created!');
      results.createResults[1].should.equal('data created!');
      results.createResults[2].should.equal('data created!');
      done();
    })
    .then(null, done);
  });

  it('should resolve with all the data that got created', function(done) {
    nock('http://google.com')
      .post('/updateurl/1111')
      .reply(200, 'data updated!');

    nock('http://google.com')
      .post('/updateurl/2222')
      .reply(200, 'data updated!');

    nock('http://google.com')
      .post('/updateurl/3333')
      .reply(200, 'data updated!');

    var loader = restLoader({
      host: 'google.com',
      protocol: 'http',
      pathname: 'updateurl',
      identifier: '_id'
    });
    loader.load({
      create:[],
      update:[{
        _id: '1111',
        data1: 'test'
      }, {
        _id: '2222',
        data2: 'test'
      }, {
        _id: '3333',
        data3: 'test'
      }],
      delete: []
    }).then(function(results) {
      results.createResults.length.should.equal(0);

      results.updateResults.length.should.equal(3);
      results.updateResults[0].should.equal('data updated!');
      results.updateResults[1].should.equal('data updated!');
      results.updateResults[2].should.equal('data updated!');

      results.deleteResults.length.should.equal(0);
      done();
    })
    .then(null, done);
  });

  it('should resolve with all the data from the delete requests', function(done) {
    nock('http://google.com')
      .delete('/deleteurl/1111')
      .reply(200, 'data deleted!');

    nock('http://google.com')
      .delete('/deleteurl/2222')
      .reply(200, 'data deleted!');

    nock('http://google.com')
      .delete('/deleteurl/3333')
      .reply(200, 'data deleted!');

    var loader = restLoader({
      host: 'google.com',
      protocol: 'http',
      pathname: 'deleteurl',
      identifier: '_id'
    });
    loader.load({
      create:[],
      update: [],
      delete:[{
        _id: '1111',
        data1: 'test'
      }, {
        _id: '2222',
        data2: 'test'
      }, {
        _id: '3333',
        data3: 'test'
      }]
    }).then(function(results) {
      results.createResults.length.should.equal(0);
      results.updateResults.length.should.equal(0);

      results.deleteResults.length.should.equal(3);
      results.deleteResults[0].should.equal('data deleted!');
      results.deleteResults[1].should.equal('data deleted!');
      results.deleteResults[2].should.equal('data deleted!');

      done();
    })
    .then(null, done);
  });

  it('should create, update, and delete 1 doc respectively', function(done) {
    nock('http://google.com')
      .post('/url')
      .reply(200, 'data created!');

    nock('http://google.com')
      .post('/url/2222')
      .reply(200, 'data updated!');

    nock('http://google.com')
      .delete('/url/3333')
      .reply(200, 'data deleted!');

    var loader = restLoader({
      host: 'google.com',
      protocol: 'http',
      pathname: 'url',
      identifier: '_id'
    });
    loader.load({
      create: [{_id: '1111', data: 'test'}],
      update: [{_id: '2222', data: 'test'}],
      delete: [{_id: '3333', data: 'test'}]
    })
    .then(function(results) {
      results.createResults.length.should.equal(1);
      results.createResults[0].should.equal('data created!');

      results.updateResults.length.should.equal(1);
      results.updateResults[0].should.equal('data updated!');

      results.deleteResults.length.should.equal(1);
      results.deleteResults[0].should.equal('data deleted!');

      done();
    })
    .then(null, done);
  });

  it('should resolve even if there is no data to create, update, or delete', function(done) {
    var loader = restLoader(options);
    loader.load({
      create: [],
      update: [],
      delete: []
    })
    .then(function(results) {
      results.createResults.length.should.equal(0);
      results.updateResults.length.should.equal(0);
      results.deleteResults.length.should.equal(0);
      done();
    })
    .then(null, done);
  });
});
