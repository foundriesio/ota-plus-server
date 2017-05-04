import { observable } from 'mobx';
import axios from 'axios';
import FileSaver from 'file-saver';
import JSZip from 'jszip';
import { 
    API_PROVISIONING_STATUS, 
    API_PROVISIONING_ACTIVATE,
    API_PROVISIONING_DETAILS,
    API_PROVISIONING_KEYS_FETCH,
    API_PROVISIONING_KEY_CREATE,
    API_FEATURES_TREEHUB_ACTIVATE
} from '../config';
import { 
    resetAsync, 
    handleAsyncSuccess, 
    handleAsyncError 
} from '../utils/Common';

export default class ProvisioningStore {

    @observable provisioningStatusFetchAsync = {};
    @observable provisioningActivateAsync = {};
    @observable provisioningDetailsFetchAsync = {};
    @observable provisioningKeysFetchAsync = {};
    @observable provisioningKeyCreateAsync = {};
    @observable provisioningStatus = {};
    @observable provisioningDetails = {};
    @observable provisioningKeys = [];

    constructor() {
        resetAsync(this.provisioningStatusFetchAsync);
        resetAsync(this.provisioningActivateAsync);
        resetAsync(this.provisioningDetailsFetchAsync);
        resetAsync(this.provisioningKeysFetchAsync);
        resetAsync(this.provisioningKeyCreateAsync);
    }

    fetchProvisioningStatus() {
        resetAsync(this.provisioningStatusFetchAsync, true);
        return axios.get(API_PROVISIONING_STATUS)
            .then(function (response) {
                this.provisioningStatus = response.data;
                if(response.data.active) {
                    this.fetchProvisioningDetails();
                    this.fetchProvisioningKeys();
                }
                this.provisioningStatusFetchAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.provisioningStatusFetchAsync = handleAsyncError(error);
            }.bind(this));
    }

    activateProvisioning() {
        resetAsync(this.provisioningActivateAsync, true);
        return axios.put(API_PROVISIONING_ACTIVATE)
            .then(function (response) {
                this.fetchProvisioningStatus();
                this.provisioningActivateAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.provisioningActivateAsync = handleAsyncError(error);
            }.bind(this));
    }

    fetchProvisioningDetails() {
        resetAsync(this.provisioningDetailsFetchAsync, true);
        return axios.get(API_PROVISIONING_DETAILS)
            .then(function (response) {
                this.provisioningDetails = response.data;
                this.provisioningDetailsFetchAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.provisioningDetailsFetchAsync = handleAsyncError(error);
            }.bind(this));
    }

    fetchProvisioningKeys() {
        resetAsync(this.provisioningKeysFetchAsync, true);
        return axios.get(API_PROVISIONING_KEYS_FETCH)
            .then(function (response) {
                this.provisioningKeys = response.data;
                this.provisioningKeysFetchAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.provisioningKeysFetchAsync = handleAsyncError(error);
            }.bind(this));
    }

    createProvisioningKey(data) {
        resetAsync(this.provisioningKeyCreateAsync, true);
        return axios.post(API_PROVISIONING_KEY_CREATE, data)
            .then(function (response) {
                this.fetchProvisioningKeys();
                this.provisioningKeyCreateAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.provisioningKeyCreateAsync = handleAsyncError(error);
            }.bind(this));
    }

    downloadProvisioningKeyBundle(keyUuid) {
        return axios.all([
                axios.get(API_PROVISIONING_KEYS_FETCH + '/' + keyUuid),
                axios.get(API_FEATURES_TREEHUB_ACTIVATE + '/client')])
            .then(axios.spread(function (provResp, treehubResp) {
                var zip = new JSZip();
                zip.file("autoprov.url", this.provisioningDetails.hostName);
                zip.file("autoprov_credentials.p12", provResp.data);
                zip.file("treehub.json", JSON.stringify(treehubResp.data, null, 2));
                zip.generateAsync({type: "blob"})
                    .then(function (content) {
                        FileSaver.saveAs(content, "credentials.zip");
                    }
                );
            }.bind(this)))
            .catch(function (error) {
                handleAsyncError(error);
            }.bind(this));
    }

    _reset() {
        resetAsync(this.provisioningStatusFetchAsync);
        resetAsync(this.provisioningActivateAsync);
        resetAsync(this.provisioningDetailsFetchAsync);
        resetAsync(this.provisioningKeysFetchAsync);
        resetAsync(this.provisioningKeyCreateAsync);
        this.provisioningStatus = {};
        this.provisioningDetails = {};
        this.provisioningKeys = [];
    }
}
