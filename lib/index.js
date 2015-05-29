'use strict';

var q = require('q');
var _ = require('lodash');
var request = require('request');
var validUrl = require('valid-url');

module.exports = function RESTLoader(options) {
  var createUrl;

  if(_.isString(options)) {
    createUrl = options;
  } else if (_.has(options, 'createUrl') && _.isString(options.createUrl)) {
    createUrl = options.createUrl;
  }
  if(_.isUndefined(validUrl.is_web_uri(createUrl))) {
    throw new Error('invalid create url');
  }

  var makeRequest = function makeRequest(requestOpts) {
    var deferred = q.defer();
    request(requestOpts, function(err, res) {
      if(!!err) {
        deferred.reject(err);
      } else if (!(/^2/.test('' + res.statusCode))) {
        deferred.reject({
          error: 'STATUS_CODE_ERROR',
          response: res
        });
      } else {
        deferred.resolve(res.body);
      }
    });
    return deferred.promise;
  };

  var makeCreateRequest = function makeCreateRequest(data) {
    var requestOpts = {
      uri: createUrl,
      method: 'POST',
      json: data
    };

    return makeRequest(requestOpts);
  };

  var loadData = function loadData(dataArray) {
    if(!dataArray) {
      return q.resolve([]);
    }
    if(!_.isArray(dataArray)) {
      dataArray = [dataArray];
    }
    if(dataArray.length === 0) {
      return q.resolve([]);
    }

    var promise;
    var createdData = [];
    _.forEach(dataArray, function(data) {
      if(!promise) {
        promise = makeCreateRequest(data)
          .then(function(result) {
            createdData.push(result);
          });
      } else {
        promise = promise.then(function() {
          return makeCreateRequest(data)
            .then(function(result) {
              createdData.push(result);
            });
        });
      }
    });
    return promise.then(function() {
      return createdData;
    });
  };

  var load = function load(data) {
    if(_.isUndefined(data) || _.isUndefined(data.create)) {
      throw new Error('no creation data supplied');
    }
    return loadData(data.create);
  };

  return {
    load: load
  };
};
