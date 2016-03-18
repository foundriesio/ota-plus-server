define(function(require) {
  var SotaDispatcher = require('sota-dispatcher'),
      _ = require('underscore'),
      db = require('../stores/db'),
      checkExists = require('../mixins/check-exists'),
      sendRequest = require('../mixins/send-request');

  var createPackage = function(payload) {
    var url = '/api/v1/packages/' + payload.package.name + '/' + payload.package.version +
      '?description=' + encodeURIComponent(payload.package.description) +
      '&vendor=' + encodeURIComponent(payload.package.vendor);
    sendRequest.doPut(url, payload.data, {form: true})
      .success(function() {
        location.hash = "#/packages/" + payload.package.name + "/" + payload.package.version;
        SotaDispatcher.dispatch({actionType: 'get-packages'});
        SotaDispatcher.dispatch({actionType: 'search-packages-by-regex'});
      });
  };

  var Handler = (function() {
      this.dispatchCallback = function(payload) {
        switch(payload.actionType) {
          case 'get-packages':
            sendRequest.doGet('/api/v1/packages')
              .success(function(packages) {
                db.packages.reset(packages);
              });
          break;
          case 'get-package':
            sendRequest.doGet('/api/v1/packages')
              .success(function(packages) {
                db.showPackage.reset(_.find(packages, function(package) {
                  return package.id.name == payload.name && package.id.version == payload.version;
                }));
              });
          break;
          case 'create-package':
            checkExists('/api/v1/packages/' + payload.package.name + '/' + payload.package.version,
              "Package", function() {
                createPackage(payload);
              });
          break;
          case 'search-packages-by-regex':
            var query = payload.regex ? '?regex=' + payload.regex : '';
            db.searchablePackages.reset([{"size": 35768,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "1.2.3","name": "myPackage"},"vendor": "AcmeSoftware"},{"size": 23423,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "4.2.4","name": "The new one"},"vendor": "AcmeSoftware"},{"size": 35768,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "2.3.4","name": "myPackage"},"vendor": "AcmeSoftware"}]);
//            sendRequest.doGet('/api/v1/packages' + query)
//              .success(function(packages) {
//                db.searchablePackages.reset(packages);
//              });
          break;
          case 'get-packages-for-vin':
//            sendRequest.doGet('/api/v1/vehicles/' + payload.vin + '/package')
//              .success(function(packages) {
//                var list = _.map(packages, function(package) {
//                  return {id: package}
//                });
//                db.packagesForVin.reset(list);
//              });
                db.packagesForVin.reset([{"size": 35768,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "1.2.3","name": "myPackage"},"vendor": "AcmeSoftware"},{"size": 23423,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "4.2.4","name": "The new one"},"vendor": "AcmeSoftware"},{"size": 35768,"description": "testing","uri": {"uri": "http://path/to/file"},"checkSum": "5tsJvSyE22ZTQQfaTvAOat3Muo4=","id": {"version": "2.3.4","name": "myPackage"},"vendor": "AcmeSoftware"}]);
          break;
          case 'get-vehicles-queued-for-package':
            sendRequest.doGet('/api/v1/packages/' + payload.name + "/" + payload.version + "/queued")
              .success(function(vehicles) {
                db.vehiclesQueuedForPackage.reset(vehicles);
              });
          break;
        }
      };
      SotaDispatcher.register(this.dispatchCallback.bind(this));
  });

  return new Handler();

});
