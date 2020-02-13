/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Form, Input } from 'formsy-antd';
import { Row, Col, Button as AntdButton, Input as TextInput } from 'antd';
import serialize from 'form-serialize';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import { Button, OTAModal, Loader, FormSelect, OperationCompletedInfo, ModalTitleWrapper } from '../../partials';
import { URL_SOFTWARE_PUSHING_UPDATES } from '../../constants/urlConstants';
import { assets, SOFTWARE_ICON_GRAY } from '../../config';

@inject('stores')
@observer
class CreateModal extends Component {
  @observable softwareName = '';

  @observable softwareVersion = '';

  @observable fileName = null;

  @observable fileUploadedAt = null;

  @observable selectedHardwareIds = [];

  constructor(props) {
    super(props);
    this.fileUploadRef = React.createRef();
    this.fileUploadedAt = undefined;
  }

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
      formData.append('file', this.fileUploadRef.current.files[0]);
    }

    const data = serialize(document.querySelector('#software-create-form'), { hash: true });
    delete data['fake-file'];
    data.description = data.description ? data.description : '';
    data.vendor = data.vendor ? data.vendor : '';
    softwareStore.createPackage(data, formData, this.selectedHardwareIds.join());
    this.hideModal();
  };

  onFileUploadClick = (e) => {
    if (e) e.preventDefault();
    const fileUploadDom = this.fileUploadRef.current;
    fileUploadDom.click();
  };

  onFileChange = (event) => {
    /* toDo: split based of `\` only affects windows paths */
    const name = event.target.value.split('\\').pop();
    this.fileName = name;
    this.fileUploadedAt = moment().format();
  };

  hideModal = (e) => {
    const { hide } = this.props;
    if (e) e.preventDefault();
    this.fileName = null;
    this.fileUploadedAt = undefined;
    this.selectedHardwareIds = [];
    hide();
  };

  selectHardwareIds = (selectedOptions) => {
    this.selectedHardwareIds = selectedOptions;
  };

  onInputChange = value => (event) => {
    this[value] = event.target.value;
  };

  render() {
    const { stores, shown, hide, fileDropped, t } = this.props;
    const { hardwareStore } = stores;
    const isSubmitEnabled = this.softwareName
                            && this.softwareVersion
                            && this.selectedHardwareIds.length
                            && this.fileName;
    const directorForm = (
      <Form onValidSubmit={this.submitForm} id="software-create-form">
        <Row className="gutter-bottom">
          {t('software.create_modal.intro_1')}
          <a
            href={URL_SOFTWARE_PUSHING_UPDATES}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('software.create_modal.intro_link')}
          </a>
          {t('software.create_modal.intro_2')}
        </Row>
        <Row className="row">
          <Col span={12}>
            <label className="c-form__label">
              {t('software.create_modal.software_name')}
            </label>
            <TextInput
              id="add-new-software-name"
              className="c-form__input c-form__input--antd"
              placeholder={t('software.create_modal.software_name_placeholder')}
              name="packageName"
              onChange={this.onInputChange('softwareName')}
            />
          </Col>
          <Col span={12}>
            <label className="c-form__label">
              {t('software.create_modal.version')}
            </label>
            <TextInput
              id="add-new-software-version"
              className="c-form__input c-form__input--antd"
              placeholder={t('software.create_modal.version_placeholder')}
              name="version"
              onChange={this.onInputChange('softwareVersion')}
            />
          </Col>
        </Row>
        <Row className="row">
          <Col span={12}>
            <div className="ecu-types-select">
              {hardwareStore.hardwareIdsFetchAsync.isFetching ? (
                <Loader />
              ) : (
                <FormSelect
                  multiple
                  appendMenuToBodyTag
                  label={t('software.create_modal.ecu_types')}
                  id="ecu-types-select"
                  placeholder={t('software.create_modal.ecu_types_placeholder')}
                  onChange={this.selectHardwareIds}
                  visibleFieldsCount={4}
                  defaultValue={_.isArray(this.selectedHardwareIds) ? this.selectedHardwareIds : null}
                  options={hardwareStore.hardwareIds}
                />
              )}
            </div>
          </Col>
        </Row>
        <Row className="row no-margin-bottom no-margin-top">
          <Col span={12}>
            <div className="upload-wrapper">
              {!fileDropped && (
                <div>
                  <AntdButton
                    htmlType="button"
                    className="add-button file-input"
                    onClick={this.onFileUploadClick}
                    id="choose-software"
                  >
                    <div>{t('software.create_modal.choose_file')}</div>
                  </AntdButton>
                  <div className="description">{t('software.create_modal.file_information')}</div>
                </div>
              )}
              <input
                ref={this.fileUploadRef}
                name="file"
                type="file"
                onChange={this.onFileChange.bind(this)}
                className="file"
                id="file-input-hidden"
              />
              {<Input
                type="text"
                name="fake-file"
                value={(fileDropped && fileDropped.name) || this.fileName}
                style={{ display: 'none' }}
                required
              />}

            </div>
            <div className="anim-info-container">
              <OperationCompletedInfo
                info={t(
                  'software.create_modal.file_selected',
                  { file_name: (fileDropped && fileDropped.name) || this.fileName }
                )}
                preserve
                trigger={
                  { name: (fileDropped && fileDropped.name) || this.fileName, createdAt: this.fileUploadedAt }
                }
              />
            </div>
          </Col>
        </Row>
        <Row className="row no-margin-bottom no-margin-top">
          <Col span={24}>
            <div className="body-actions no-margin">
              <Button
                light="true"
                htmlType="submit"
                type="primary"
                disabled={!isSubmitEnabled}
                id="add-new-package-confirm"
              >
                {t('software.create_modal.add')}
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    );
    return (
      <OTAModal
        title={(
          <ModalTitleWrapper>
            <img src={SOFTWARE_ICON_GRAY} />
            {t('software.create_modal.title')}
          </ModalTitleWrapper>
        )}
        topActions={(
          <div className="top-actions flex-end">
            <div className="modal-close" onClick={hide}>
              <img src={assets.DEFAULT_CLOSE_ICON} alt="Icon" />
            </div>
          </div>
        )}
        content={directorForm}
        visible={shown}
        className="add-software-modal"
      />
    );
  }
}

CreateModal.propTypes = {
  shown: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  stores: PropTypes.shape({}),
  fileDropped: PropTypes.shape({}),
  t: PropTypes.func.isRequired
};

export default withTranslation()(CreateModal);
