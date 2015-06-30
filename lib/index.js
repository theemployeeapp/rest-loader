'use strict';

var q = require('q');
var _ = require('lodash');
var request = require('request');
var url = require('url');

module.exports = function RESTLoader(options) {
  var urlOpts, identifier;

  if(!_.isString(options.host) || !_.isString(options.protocol) || !_.isString(options.pathname)) {
    throw new Error('host, protocol, and pathname are required');
  } else {
    urlOpts = {
      hostname: options.host,
      protocol: options.protocol,
      pathname: options.pathname
    };
    if(!_.isUndefined(options.port)) {
      urlOpts.port = options.port;
    }
    if(_.isObject(options.query)) {
      urlOpts.query = options.query;
    }
    if(_.isString(options.identifier)) {
      identifier = options.identifier;
    }
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
      uri: url.format(urlOpts),
      method: 'POST',
      json: data
    };
    return makeRequest(requestOpts);
  };

  var makeUpdateRequest = function makeUpdateRequest(data) {
    var requestOpts = {
      uri: url.format(urlOpts) + '/' + data[identifier],
      method: 'POST',
      json: data
    };
    return makeRequest(requestOpts);
  };

  var makeDeleteRequest = function makeDeleteRequest(data) {
    var requestOpts = {
      uri: url.format(urlOpts) + '/' + data[identifier],
      method: 'DELETE'
    };
    return makeRequest(requestOpts);
  };

  var buildRequests = function buildRequests(dataArray, makeRequestFunc) {
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
    var results = [];
    _.forEach(dataArray, function(data) {
      if(!promise) {
        promise = makeRequestFunc(data)
          .then(function(result) {
            results.push(result);
          });
      } else {
        promise = promise.then(function() {
          return makeRequestFunc(data)
            .then(function(result) {
              results.push(result);
            });
        });
      }
    });
    return promise.then(function() {
      return results;
    });
  };

  var createData = function createdata(dataArray) {
    return buildRequests(dataArray, makeCreateRequest);
  };

  var updateData = function updateData(dataArray) {
    return buildRequests(dataArray, makeUpdateRequest);
  };

  var deleteData = function deleteData(dataArray) {
    return buildRequests(dataArray, makeDeleteRequest);
  };

  var load = function load(data) {
    if(_.isUndefined(data) || _.isUndefined(data.create)) {
      throw new Error('no creation data supplied');
    }
    var results = {};
    return createData(data.create)
      .then(function(createdData) {
        results.createResults = createdData;
        if(!_.isUndefined(data.update)) {
          return updateData(data.update);
        } else {
          return [];
        }
      })
      .then(function(updatedData) {
        results.updateResults = updatedData;
        if(!_.isUndefined(data.delete)) {
          return deleteData(data.delete);
        } else {
          return [];
        }
      })
      .then(function(deletedData) {
        results.deleteResults = deletedData;
        return results;
      });
  };

  return {
    load: load
  };
};
