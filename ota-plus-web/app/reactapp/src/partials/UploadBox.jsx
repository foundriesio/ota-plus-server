/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Progress } from 'antd';
import { translate } from 'react-i18next';
import _ from 'lodash';
import { SoftwareCancelUploadModal, SoftwareCancelAllUploadsModal } from '../components/software';
import { ConvertTime, ConvertBytes } from '../utils';
import OTAModal from './OTAModal';

@inject('stores')
@observer
class UploadBox extends Component {
  @observable cancelUploadModalShown = false;
  @observable cancelAllUploadsModalShown = false;
  @observable actionUploadIndex = null;
  @observable ifClearUploads = false;

  toggleMode = e => {
    if (e) e.preventDefault();
    this.props.toggleUploadBoxMode();
  };

  removeFromList = (index, e) => {
    if (e) e.preventDefault();
    const { softwareStore } = this.props.stores;
    softwareStore.packagesUploading.splice(index, 1);
  };

  showCancelUploadModal = (index, e) => {
    if (e) e.preventDefault();
    this.cancelUploadModalShown = true;
    this.actionUploadIndex = index;
  };

  hideCancelUploadModal = e => {
    if (e) e.preventDefault();
    this.cancelUploadModalShown = false;
    this.actionUploadIndex = null;
  };

  showCancelAllUploadsModal = (ifClear = false, e) => {
    if (e) e.preventDefault();
    this.cancelAllUploadsModalShown = true;
    this.ifClearUploads = ifClear;
  };

  hideCancelAllUploadsModal = e => {
    if (e) e.preventDefault();
    this.cancelAllUploadsModalShown = false;
  };

  close = e => {
    if (e) e.preventDefault();
    const { softwareStore } = this.props.stores;
    let uploadFinished = true;
    _.each(softwareStore.packagesUploading, upload => {
      if (upload.status === null) uploadFinished = false;
    });
    if (uploadFinished) {
      softwareStore.packagesUploading = [];
    } else {
      this.showCancelAllUploadsModal(true, null);
    }
  };

  render() {
    const { t, minimized, toggleUploadBoxMode } = this.props;
    const { softwareStore } = this.props.stores;
    const barOptions = {
      strokeWidth: 18,
      easing: 'easeInOut',
      color: '#A7DCD4',
      trailColor: '#eee',
      trailWidth: 18,
      svgStyle: null,
    };
    let uploadFinished = true;
    let totalSize = 0;
    let secondsRemaining = 0;
    _.each(softwareStore.packagesUploading, upload => {
      let uploadSize = upload.size / (1024 * 1024);
      let uploadedSize = !isNaN(upload.uploaded) ? upload.uploaded / (1024 * 1024) : 0;
      let uploadSpeed = !isNaN(upload.upSpeed) ? upload.upSpeed : 100;
      let timeLeft = (upload.size - upload.uploaded) / (1024 * uploadSpeed);
      timeLeft = isFinite(timeLeft) ? timeLeft : secondsRemaining;
      secondsRemaining = timeLeft > secondsRemaining ? timeLeft : secondsRemaining;
      if (upload.status === null) uploadFinished = false;
    });
    const uploadBoxData = (
      <div id='upload-box'>
        <div className='subheading'>
          <div className='left'>
            {uploadFinished ? (
              <span>Upload is finished</span>
            ) : (
              <span id='timeleft'>
                <ConvertTime seconds={secondsRemaining} />
                &nbsp;left
              </span>
            )}
          </div>
          <div className='right'>
            {!uploadFinished ? (
              <a href='#' onClick={this.showCancelAllUploadsModal.bind(this, false)} id='cancel-all-uploads'>
                Cancel all
              </a>
            ) : null}
          </div>
        </div>
        <div className='content'>
          <ul className='list'>
            {_.map(
              softwareStore.packagesUploading,
              (upload, index) => {
                return (
                  <li key={index}>
                    <div className='col name' id='package-name'>
                      {upload.package.name}
                    </div>
                    <div className='col version' id='package-version'>
                      {upload.package.version}
                    </div>
                    <div className='col uploaded' id='uploaded-bytes'>
                      <ConvertBytes bytes={upload.uploaded} />
                      &nbsp;of&nbsp;
                      <ConvertBytes bytes={upload.size} />
                    </div>

                    <div className='col status' id='upload-status'>
                      {upload.progress !== 100 && upload.status === null ? (
                        <Progress type='circle' percent={upload.progress / 100} showInfo={false} width={24} strokeWidth={20} strokeColor={'#A7DCD4'} />
                      ) : upload.status == 'success' ? (
                        <span id='success'>
                          <img src='/assets/img/icons/green_tick.svg' alt='Icon' /> Success
                        </span>
                      ) : upload.status == 'error' ? (
                        <span id='error'>
                          <i className='fa fa-exclamation-triangle' aria-hidden='true' /> Error
                        </span>
                      ) : (
                        <span id='processing'>
                          <i className='fa fa-square-o fa-spin' /> &nbsp;
                          <span className='counting black'>Processing</span>
                        </span>
                      )}
                    </div>

                    <div className='col action'>
                      {upload.status === null ? (
                        <a href='#' onClick={this.showCancelUploadModal.bind(this, index)} id='cancel-upload'>
                          cancel
                        </a>
                      ) : (
                        <a href='#' onClick={this.removeFromList.bind(this, index)} id='remove-from-list'>
                          remove from list
                        </a>
                      )}
                    </div>
                  </li>
                );
              },
              this,
            )}
          </ul>
        </div>
        <SoftwareCancelUploadModal shown={this.cancelUploadModalShown} hide={this.hideCancelUploadModal} uploadIndex={this.actionUploadIndex} softwareStore={softwareStore} />
        <SoftwareCancelAllUploadsModal shown={this.cancelAllUploadsModalShown} hide={this.hideCancelAllUploadsModal} ifClearUploads={this.ifClearUploads} softwareStore={softwareStore} />
      </div>
    );
    const title = 'Uploading ' + t('common.softwareWithCount', { count: softwareStore.packagesUploading.length });
    return (
      <OTAModal
        title={title}
        topActions={
          <div className='top-actions flex-end'>
            <div className='modal-minimize' onClick={this.toggleMode} id='minimize-upload-box'>
              <img src='/assets/img/icons/minimize.svg' alt='Icon' />
            </div>
            <div className='modal-close' onClick={this.close} id='close-upload-box'>
              <img src='/assets/img/icons/close.svg' alt='Icon' />
            </div>
          </div>
        }
        content={uploadBoxData}
        visible={softwareStore.packagesUploading.length && !minimized ? true : false}
        onRequestClose={toggleUploadBoxMode}
        className='upload-box'
      />
    );
  }
}

UploadBox.propTypes = {
  stores: PropTypes.object,
};

export default translate()(UploadBox);
