define(function(require) {
  var SotaDispatcher = require('sota-dispatcher'),
      _ = require('underscore'),
      db = require('../stores/db'),
      checkExists = require('../mixins/check-exists'),
      sendRequest = require('../mixins/send-request'),
      moment = require('moment');
      
  var Handler = (function() {
      this.dispatchCallback = function(payload) {
        switch(payload.actionType) {
          case 'get-devices':
            sendRequest.doGet('/api/v1/devices_info?status=true', {action: payload.actionType})
              .success(function(devices) {
                db.devices.reset(devices);
              });
            break;
          case 'get-device':
            sendRequest.doGet('/api/v1/devices_info/' + payload.uuid + "?status=true", {action: payload.actionType})
              .success(function(device) {
                db.device.reset(device);
              });
            break;
          case 'create-device':
            sendRequest.doPost('/api/v1/devices', payload.device, {action: payload.actionType})
              .success(function(id) {
                location.hash = "#/devicedetails/" + id;
              });
            break;
          case 'edit-device':
            sendRequest.doPut('/api/v1/devices/' + payload.uuid, payload.device, {action: payload.actionType})
              .success(function(id) {
              });
            break;
          case 'search-devices-by-regex':
            var query = payload.regex ? '&regex=(?i)' + payload.regex : '';
            sendRequest.doGet('/api/v1/devices_info?status=true' + query, {action: payload.actionType})
              .success(function(devices) {
                db.searchableDevices.reset(devices);
              });
            break;
          case 'get-package-queue-for-device':
            if (!_.isUndefined(payload.device)) {
              sendRequest.doGet('/api/v1/device_updates/' + payload.device + '/queued', {action: payload.actionType})
                .success(function(packages) {
                  db.packageQueueForDevice.reset(packages);
                });
            }
            break;
          case 'get-package-history-for-device':
            sendRequest.doGet('/api/v1/history?uuid=' + payload.device, {action: payload.actionType})
              .success(function(packages) {
                db.packageHistoryForDevice.reset(packages);
              });
            break;
          case 'sync-packages-for-device':
            sendRequest.doPut('/api/v1/device_updates/' + payload.device + '/sync', null, {action: payload.actionType});
            break;
          case 'install-package-for-device':
            sendRequest.doPost('/api/v1/device_updates/' + payload.device, payload.data, {action: payload.actionType})
              .success(function() {
                SotaDispatcher.dispatch({actionType: "get-package-queue-for-device", device: payload.device});
                SotaDispatcher.dispatch({actionType: 'get-device', uuid: payload.device});
              });
            break;
          case 'reorder-queue-for-device':
            sendRequest.doPut('/api/v1/device_updates/' + payload.device + '/order', payload.order, {action: payload.actionType})
              .success(function() {
                SotaDispatcher.dispatch({actionType: 'get-package-queue-for-device', device: payload.device});
              });
          break;
          case 'cancel-update':
            sendRequest.doPut('/api/v1/device_updates/' + payload.device + '/' + payload.updateid + '/cancelupdate', null, {action: payload.actionType})
              .success(function() {
                SotaDispatcher.dispatch({actionType: 'get-package-queue-for-device', device: payload.device});
                SotaDispatcher.dispatch({actionType: 'get-device', uuid: payload.device});
              });
          break;
          case 'search-production-devices':
            var devices = [];

            if(payload.regex.length >= 17) {
              sendRequest.doGet('/api/v1/devices_info?status=true', {action: payload.actionType})
              .success(function(data) {
                devices = _.filter(data, function(device) {
                  return device.uuid == localStorage.getItem('firstProductionTestDevice');
                });
                
                devices[0].deviceName = payload.regex.substr(0, 17);
                db.searchableProductionDevices.reset(devices);
              });
            } else {
              db.searchableProductionDevices.reset([]);
            }
          break;
          case 'get-production-device':
            sendRequest.doGet('/api/v1/devices_info?status=true', {action: payload.actionType})
              .success(function(devices) {
                db.device.reset(_.find(devices, function(device) {
                  return device.uuid == localStorage.getItem('firstProductionTestDevice');
                }));
              });
          break;
          case 'get-installation-log-for-device':
            sendRequest.doGet('/api/v1/device_updates/' + payload.device + '/results', {action: payload.actionType})
              .success(function(log) {
                db.installationLogForDevice.reset(log);
              });
          break;
          case 'get-installation-log-for-updateid':
            sendRequest.doGet('/api/v1/device_updates/' + payload.device + '/'  + payload.updateId + '/results', {action: payload.actionType})
              .success(function(log) {
                db.installationLogForUpdateId.reset(log);
              });
          break;
          case 'unblock-queue':
            sendRequest.doPut('/api/v1/device_updates/' + payload.device + '/unblock', null, {action: payload.actionType})
              .success(function(result) {
              });
          break;
          case 'get-auto-install-packages-for-device':
            sendRequest.doGet('/api/v1/auto_install?device=' + payload.device, {action: payload.actionType})
              .success(function(autoInstallPackagesForDevice) {
                db.autoInstallPackagesForDevice.reset(autoInstallPackagesForDevice);
              });
          break;
          case 'enable-package-auto-install-for-device':
            sendRequest.doPut('/api/v1/auto_install/' + payload.packageName + '/' + payload.device, null, {action: payload.actionType})
              .success(function() {
              });
          break;
          case 'disable-package-auto-install-for-device':
            sendRequest.doDelete('/api/v1/auto_install/' + payload.packageName + '/' + payload.device, null, {action: payload.actionType})
              .success(function() {
              });
          break;
          case 'get-usage-per-month':
            var startTime = payload.startTime;
            var endTime = payload.endTime;
            var usageTypesCount = 3;
            var objKey = startTime.format('YYYY') + '' + startTime.format('MM');
            var usagePerMonth = {};
            usagePerMonth[objKey] = {};
            var after = _.after(usageTypesCount, function() {
              db.usagePerMonth.reset(usagePerMonth);
            });
            
            sendRequest.doGet('/api/v1/auditor/devices_seen_in/' + startTime.format('YYYY') + '/' + startTime.format('M'), {action: payload.actionType})
              .success(function(activeDevices) {       
                usagePerMonth[objKey].activeDevices = activeDevices;
              })
              .always(function() {
                after();
              });
              
            sendRequest.doGet('/api/v1/active_device_count?start=' + encodeURIComponent(startTime.toISOString()) + '&end=' + encodeURIComponent(endTime.toISOString()), {action: payload.actionType})
              .success(function(activatedDevices) {
                usagePerMonth[objKey].activatedDevices = activatedDevices;
              })
              .always(function() {
                after();
              });
              
            sendRequest.doGet('/api/v1/active_device_count?start=' + encodeURIComponent(new Date(0).toISOString()) + '&end=' + encodeURIComponent(endTime.toISOString()), {action: payload.actionType})
              .success(function(totalActivatedDevices) {
                usagePerMonth[objKey].totalActivatedDevices = totalActivatedDevices;
              })
              .always(function() {
                after();
              }); 
          break;
        }
      };
      SotaDispatcher.register(this.dispatchCallback.bind(this));
  });

  return new Handler();

});
