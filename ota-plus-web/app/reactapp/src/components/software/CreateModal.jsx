/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Form, Input } from 'formsy-antd';
import { Row, Col, Button, Input as TextInput } from 'antd';
import serialize from 'form-serialize';
import _ from 'lodash';

import { OTAModal, Loader, FormSelect } from '../../partials';

@inject('stores')
@observer
class CreateModal extends Component {
  @observable softwareName = '';
  @observable softwareVersion = '';
  @observable fileName = null;
  @observable selectedHardwareIds = [];

  componentDidMount() {
    const { stores } = this.props;
    const { hardwareStore } = stores;
    hardwareStore.fetchHardwareIds();
  }

  /* ToDo: investigate and improve submit function */
  submitForm = () => {
    const { stores, fileDropped } = this.props;
    const { softwareStore } = stores;
    const formData = new FormData();

    if (fileDropped) {
      formData.append('file', fileDropped);
    } else {
      formData.append('file', this.refs.fileUpload.files[0]);
    }

    const data = serialize(document.querySelector('#software-create-form'), { hash: true });
    delete data['fake-file'];
    data.description = data.description ? data.description : '';
    data.vendor = data.vendor ? data.vendor : '';
    softwareStore.createPackage(data, formData, this.selectedHardwareIds.join());
    this.hideModal();
  };

  _onFileUploadClick = e => {
    if (e) e.preventDefault();
    const fileUploadDom = this.refs.fileUpload;
    fileUploadDom.click();
  };

  _onFileChange = e => {
    /* toDo: split based of `\` only affects windows paths */
    const name = e.target.value.split('\\').pop();
    this.fileName = name;
  };

  hideModal = e => {
    const { hide } = this.props;
    if (e) e.preventDefault();
    this.fileName = null;
    this.selectedHardwareIds = [];
    hide();
  };

  selectHardwareIds = selectedOptions => {
    this.selectedHardwareIds = selectedOptions;
  };

  onInputChange = value => event => {
    this[value] = event.target.value;
  };

  render() {
    const { stores, shown, hide, fileDropped } = this.props;
    const { hardwareStore } = stores;
    const isSubmitEnabled = this.softwareName && this.softwareVersion && this.selectedHardwareIds.length && this.fileName;
    const directorForm = (
      <Form onValidSubmit={this.submitForm} id='software-create-form'>
        <Row className='row'>
          <Col span={12}>
            <label className='c-form__label'>
              {'Software Name'}
            </label>
            <TextInput 
              id='add-new-software-name'
              className='c-form__input c-form__input--antd' 
              placeholder='Name' 
              name='packageName' 
              onChange={this.onInputChange('softwareName')} 
            />
          </Col>
          <Col span={12}>
            <label className='c-form__label'>
              {'Version'}
            </label>
            <TextInput 
              id='add-new-software-version'
              className='c-form__input c-form__input--antd'
              placeholder='Select version' 
              name='version' 
              onChange={this.onInputChange('softwareVersion')} 
            />
          </Col>
        </Row>
        <Row className='row'>
          <Col span={12}>
            <div className='ecu-types-select'>
              {hardwareStore.hardwareIdsFetchAsync.isFetching ? (
                <Loader />
              ) : (
                <FormSelect
                  multiple
                  appendMenuToBodyTag
                  label='ECU Types'
                  id='ecu-types-select'
                  placeholder='Select ECU types'
                  onChange={this.selectHardwareIds}
                  visibleFieldsCount={4}
                  defaultValue={_.isArray(this.selectedHardwareIds) ? this.selectedHardwareIds : null}
                  options={hardwareStore.hardwareIds}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row className='row'>
          <Col span={12}>
            <div className='upload-wrapper'>
              {!fileDropped && (
                <Button htmlType='button' className='add-button' onClick={this._onFileUploadClick} id='choose-software'>
                  <span>Choose file</span>
                </Button>
              )}
              <div className='file-name'>{(fileDropped && fileDropped.name) || this.fileName}</div>
              <input ref='fileUpload' name='file' type='file' onChange={this._onFileChange.bind(this)} className='file' id='file-input-hidden' />
              {<Input type='text' name='fake-file' value={(fileDropped && fileDropped.name) || this.fileName} style={{ display: 'none' }} required />}
            </div>
          </Col>
        </Row>
        <Row className='row'>
          <Col span={24}>
            <div className='body-actions'>
              <button className='btn-primary' disabled={!isSubmitEnabled} id='add-new-package-confirm'>
                Add
              </button>
            </div>
          </Col>
        </Row>
      </Form>
    );
    return (
      <OTAModal
        title='Add new software'
        topActions={
          <div className='top-actions flex-end'>
            <div className='modal-close' onClick={hide}>
              <img src='/assets/img/icons/close.svg' alt='Icon' />
            </div>
          </div>
        }
        content={directorForm}
        visible={shown}
        className='add-software-modal'
      />
    );
  }
}

CreateModal.propTypes = {
  shown: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  stores: PropTypes.object,
  fileDropped: PropTypes.object,
};

export default CreateModal;