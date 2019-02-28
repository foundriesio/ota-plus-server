/** @format */

const WebsocketHandler = function(wsUrl, stores) {
  const base = this;
  let stop = false;
  this.init = function() {
    this.websocket = new WebSocket(wsUrl);

    this.websocket.onopen = function() {
      console.log('WEBSOCKET: OPEN');
    };

    this.websocket.onmessage = function(msg) {
      const eventObj = JSON.parse(msg.data);
      const type = eventObj.type;
      const data = eventObj.event;
      console.log(data);
      switch (type) {
        case 'DeviceSeen':
          stores.devicesStore._updateDeviceData(data.uuid, { lastSeen: data.lastSeen });
          if (window.location.href.indexOf('/device/') > -1) {
            stores.devicesStore.fetchDirectorAttributes(data.uuid);
            stores.devicesStore._updateStatus(data.uuid, 'downloading');
          }
          break;
        case 'DeviceUpdateStatus':
          stores.devicesStore._updateDeviceData(data.device, { deviceStatus: data.status });
          break;
        case 'DeviceCreated':
          stores.devicesStore._addDevice(data);
          if (document.cookie.indexOf('fireworksPageAcknowledged') == -1 && stores.devicesStore.devicesInitialTotalCount === 1) {
            window.location = '#/fireworks';
          }
          break;
        case 'TufTargetAdded':
          stores.softwareStore._addPackage(data);
          break;
        case 'PackageBlacklisted':
          stores.softwareStore.fetchBlacklist();
          break;
        case 'UpdateSpec':
          if (window.location.href.indexOf('/device/') > -1 && stores.devicesStore.device.uuid === data.device) {
            stores.devicesStore.fetchMultiTargetUpdates(data.device);
            if (data.status === 'Finished') {
              stores.softwareStore.fetchPackagesHistory(data.device, stores.softwareStore.packagesHistoryFilter, true);
              stores.softwareStore.fetchOndevicePackages(data.device, null);
            }
          }
          if (data.status === 'Finished') {
            if (Object.keys(stores.campaignsStore.campaign).length) {
              let campaignId = stores.campaignsStore.campaign.id;
              stores.campaignsStore.fetchCampaign(campaignId);
            }
            stores.campaignsStore.fetchCampaigns('finished');
          }
          break;
        case 'DeviceSystemInfoChanged':
          stores.devicesStore.fetchDeviceNetworkInfo(data.uuid, { isFromWs: true });
          break;
        case 'DeviceEventMessage':
          stores.devicesStore._updateStatus(data.deviceUuid, 'installing');
          stores.devicesStore.fetchEvents(data.deviceUuid);
          break;
        default:
          console.log('Unhandled event type: ' + eventObj.type);
          break;
      }
    };

    this.websocket.onclose = function(msg) {
      console.log('WEBSOCKET: CLOSE');
      if (msg.code === 1006 && !stop) {
        base.init();
      }
    };

    this.websocket.onerror = function(msg) {
      console.log('WEBSOCKET: ERROR');
      console.log(msg);
      stop = true;
      base.destroy();
    };
  };

  this.destroy = function() {
    this.websocket.close();
  };
};

export default WebsocketHandler;
