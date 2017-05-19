import { observable, computed } from 'mobx';
import axios from 'axios';
import { 
    API_DEVICES_SEARCH,
    API_DEVICES_DEVICE_DETAILS,
    API_DEVICES_CREATE, 
    API_DEVICES_RENAME,
    API_DEVICES_UPDATES_LOGS
} from '../config';
import { 
    resetAsync,
    handleAsyncSuccess, 
    handleAsyncError 
} from '../utils/Common';
import _ from 'underscore';

export default class DevicesStore {

    @observable devicesFetchAsync = {};
    @observable devicesInitialFetchAsync = {};
    @observable devicesRememberedFetchAsync = {};
    @observable devicesFetchAfterDragAndDropAsync = {};
    @observable devicesFetchAfterGroupCreationAsync = {};
    @observable devicesOneFetchAsync = {};
    @observable devicesCreateAsync = {};
    @observable devicesRenameAsync = {};
    @observable initialDevices = [];
    @observable devices = [];
    @observable devicesInitialTotalCount = null;
    @observable ungroupedDevicesInitialTotalCount = null;
    @observable devicesTotalCount = null;
    @observable devicesCurrentPage = 0;
    @observable preparedDevices = [];
    @observable devicesFilter = '';
    @observable devicesGroupFilter = null;
    @observable devicesSort = 'asc';
    @observable device = {};
    @observable deviceQueue = [];
    @observable deviceHistory = [];
    @observable deviceUpdatesLogs = [];
    @observable onlineDevices = [];

    constructor() {
        resetAsync(this.devicesFetchAsync);
        resetAsync(this.devicesInitialFetchAsync);
        resetAsync(this.devicesRememberedFetchAsync);
        resetAsync(this.devicesFetchAfterDragAndDropAsync);
        resetAsync(this.devicesFetchAfterGroupCreationAsync);
        resetAsync(this.devicesOneFetchAsync);
        resetAsync(this.devicesCreateAsync);
        resetAsync(this.devicesRenameAsync);
        this.devicesLimit = 30;
    }

    fetchInitialDevices() {
        resetAsync(this.devicesInitialFetchAsync, true);
        let apiAddress = `${API_DEVICES_SEARCH}`;
        return axios.get(apiAddress)
            .then((response) => {
                this.initialDevices = response.data.values;
                this._countOnlineDevices();
                this.devicesInitialFetchAsync = handleAsyncSuccess(response);                
            })
            .catch((error) => {
                this.devicesInitialFetchAsync = handleAsyncError(error);
            });
    }

    fetchDevices(filter = '', groupId) {
        resetAsync(this.devicesFetchAsync, true);
        if(this.devicesFilter !== filter || this.devicesGroupFilter !== groupId) {
            this.devicesTotalCount = null;
            this.devicesCurrentPage = 0;
            this.devices = [];
            this.preparedDevices = [];
        }
        this.devicesFilter = filter;
        this.devicesGroupFilter = groupId;
        let apiAddress = `${API_DEVICES_SEARCH}?regex=${filter}&limit=${this.devicesLimit}&offset=${this.devicesCurrentPage*this.devicesLimit}`;
        if(groupId && groupId === 'ungrouped')
            apiAddress += `&ungrouped=true`;
        else if(groupId)
            apiAddress += `&groupId=${groupId}`;
        return axios.get(apiAddress)
            .then((response) => {
                this.devices = _.uniq(this.devices.concat(response.data.values), device => device.uuid);   
                this._prepareDevices();
                if(this.devicesInitialTotalCount === null && groupId !== 'ungrouped') {
                    this.devicesInitialTotalCount = response.data.total;
                }
                if(this.ungroupedDevicesInitialTotalCount === null && groupId === 'ungrouped') {
                    this.ungroupedDevicesInitialTotalCount = response.data.total;
                }
                this.devicesCurrentPage++;
                this.devicesTotalCount = response.data.total;
                this.devicesFetchAsync = handleAsyncSuccess(response);                
            })
            .catch((error) => {
                this.devicesFetchAsync = handleAsyncError(error);
            });
    }

    fetchRememberedDevices(filter = '', groupId) {
        resetAsync(this.devicesRememberedFetchAsync, true);
        if(this.devicesFilter !== filter || this.devicesGroupFilter !== groupId) {
            this.devicesTotalCount = null;
            this.devicesCurrentPage = 0;
            this.devices = [];
            this.preparedDevices = [];
        }
        this.devicesFilter = filter;
        this.devicesGroupFilter = groupId;
        let apiAddress = `${API_DEVICES_SEARCH}?regex=${filter}&limit=${this.devicesLimit}&offset=${this.devicesCurrentPage*this.devicesLimit}`;
        if(groupId && groupId === 'ungrouped')
            apiAddress += `&ungrouped=true`;
        else if(groupId)
            apiAddress += `&groupId=${groupId}`;
        return axios.get(apiAddress)
            .then((response) => {
                this.devices = _.uniq(this.devices.concat(response.data.values), device => device.uuid);
                this._prepareDevices();
                if(this.devicesInitialTotalCount === null) {
                    this.devicesInitialTotalCount = response.data.total;
                }
                this.devicesCurrentPage++;
                this.devicesTotalCount = response.data.total;
                this.devicesRememberedFetchAsync = handleAsyncSuccess(response);                
            })
            .catch((error) => {
                this.devicesRememberedFetchAsync = handleAsyncError(error);
            });
    }

    fetchDevicesAfterDragAndDrop(groupId) {
        resetAsync(this.devicesFetchAfterDragAndDropAsync, true);
        this.devicesTotalCount = null;
        this.devicesCurrentPage = 0;
        this.devices = [];
        this.preparedDevices = [];
        let apiAddress = `${API_DEVICES_SEARCH}?regex=&limit=${this.devicesLimit}&offset=${this.devicesCurrentPage*this.devicesLimit}`;
        if(groupId && groupId === 'ungrouped')
            apiAddress += `&ungrouped=true`;
        else if(groupId)
            apiAddress += `&groupId=${groupId}`;
        return axios.get(apiAddress)
            .then((response) => {
                this.devices = response.data.values;
                this._prepareDevices();
                if(this.devicesInitialTotalCount === null) {
                    this.devicesInitialTotalCount = response.data.total;
                }
                this.devicesCurrentPage++;
                this.devicesTotalCount = response.data.total;
                this.devicesFetchAfterDragAndDropAsync = handleAsyncSuccess(response);                
            })
            .catch((error) => {
                this.devicesFetchAfterDragAndDropAsync = handleAsyncError(error);
            });
    }

    fetchDevicesAfterGroupCreation() {
        this.devices = [];
        this.preparedDevices = [];
    }

    fetchDevice(id) {
        resetAsync(this.devicesOneFetchAsync, true);
        return axios.get(API_DEVICES_DEVICE_DETAILS + '/' + id + '?status=true')
            .then((response) => {
                this.device = response.data;
                this.devicesOneFetchAsync = handleAsyncSuccess(response);
            })
            .catch((error) => {
                this.devicesOneFetchAsync = handleAsyncError(error);
            });
    }

    createDevice(data) {
        resetAsync(this.devicesCreateAsync, true);
        return axios.post(API_DEVICES_CREATE, data)
            .then((response) => {
                this.devicesCreateAsync = handleAsyncSuccess(response);
            })
            .catch((error) => {
                this.devicesCreateAsync = handleAsyncError(error);
            });
    }

    renameDevice(id, data) {
        resetAsync(this.devicesRenameAsync, true);
        return axios.put(API_DEVICES_RENAME + '/' + id, data)
            .then((response) => {
                this.devicesRenameAsync = handleAsyncSuccess(response);
            })
            .catch((error) => {
                this.devicesRenameAsync = handleAsyncError(error);
            });
    }

    _reset() {
        resetAsync(this.devicesFetchAsync);
        resetAsync(this.devicesInitialFetchAsync);
        resetAsync(this.devicesRememberedFetchAsync);
        resetAsync(this.devicesFetchAfterDragAndDropAsync);
        resetAsync(this.devicesFetchAfterGroupCreationAsync);
        resetAsync(this.devicesOneFetchAsync);
        resetAsync(this.devicesCreateAsync);
        resetAsync(this.devicesRenameAsync);
        this.devices = [];
        this.initialDevices = [];
        this.devicesInitialTotalCount = null;
        this.ungroupedDevicesInitialTotalCount = null;
        this.devicesTotalCount = null;
        this.devicesCurrentPage = 0;
        this.preparedDevices = [];
        this.devicesFilter = '';
        this.devicesSort = 'asc';
        this.device = {};
        this.deviceQueue = [];
        this.deviceHistory = [];
        this.deviceUpdatesLogs = [];
        this.onlineDevices = [];
    }

    _getDevice(id) {
        return _.findWhere(this.devices, {uuid: id});
    }

    _updateDeviceData(id, data) {
        let device = this._getDevice(id);
        if(device) {
            _.each(data, (value, attr) => {
                device[attr] = value;
            });
        } else if(this.device) {
            if(this.device.uuid === id) {
                _.each(data, (value, attr) => {
                    this.device[attr] = value;
                });
            }
        }
    }

    _prepareDevices(devicesSort = this.devicesSort) {
        this.devicesSort = devicesSort;
        let devices = this.devices;
        this.preparedDevices = devices.sort((a, b) => {
          let aName = a.deviceName;
          let bName = b.deviceName;
          if(devicesSort !== 'undefined' && devicesSort == 'desc')
            return bName.localeCompare(aName);
          else
            return aName.localeCompare(bName);
        });
    }

    _countOnlineDevices() {
        this.onlineDevices = [];
        _.each(this.initialDevices, (device, index) => {
            if(device.deviceStatus === "UpToDate") {
                this.onlineDevices.push(device);
            }
        });
    }

    @computed get devicesCount() {
        return this.devices.length;
    }

    @computed get lastDevices() {
        return _.sortBy(this.devices, (device) => {
            return device.createdAt;
        }).reverse().slice(0,10);
    }
}