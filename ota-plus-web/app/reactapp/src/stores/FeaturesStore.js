import { observable } from 'mobx';
import axios from 'axios';
import { API_FEATURES_FETCH, API_FEATURES_TREEHUB_ACTIVATE } from '../config';
import { 
    resetAsync, 
    handleAsyncSuccess, 
    handleAsyncError 
} from '../utils/Common';

export default class FeaturesStore {

    @observable featuresFetchAsync = {};
    @observable featuresTreehubActivateAsync = {};
    @observable features = [];
    
    constructor() {
        resetAsync(this.featuresFetchAsync);
        resetAsync(this.featuresTreehubActivateAsync);
    }

    resetFeaturesFetchAsync(isFetching = false) {
        this.featuresFetchAsync = {
            isFetching: isFetching,
            status: null
        }
    }

    resetFeaturesTreehubActivateAsync(isFetching = false) {
        this.featuresTreehubActivateAsync = {
            isFetching: isFetching,
            status: null
        }
    }

    fetchFeatures() {
        resetAsync(this.featuresFetchAsync, true);
        return axios.get(API_FEATURES_FETCH)
            .then(function (response) {
                this.features = response.data;
                this.featuresFetchAsync = handleAsyncSuccess(response);
            }.bind(this))
            .catch(function (error) {
                this.featuresFetchAsync = handleAsyncError(error);
            }.bind(this));
    }

    activateTreehub() {
        resetAsync(this.featuresTreehubActivateAsync);
        return axios.put(API_FEATURES_TREEHUB_ACTIVATE)
            .then(function (response) {
                this.featuresTreehubActivateAsync = handleAsyncSuccess(response);
                this.fetchFeatures();
            }.bind(this))
            .catch(function (error) {
                this.featuresTreehubActivateAsync = handleAsyncError(error);
            }.bind(this));
    }

    _reset() {
        resetAsync(this.featuresFetchAsync);
        resetAsync(this.featuresTreehubActivateAsync);
    }
}