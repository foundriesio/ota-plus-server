/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import serialize from 'form-serialize';
import { Row, Col } from 'antd';
import { withTranslation } from 'react-i18next';

import { AsyncStatusCallbackHandler } from '../../utils';
import { OTAModal, AsyncResponse, OTAForm, FormInput } from '../../partials';
import { assets } from '../../config';

@inject('stores')
@observer
class RenameModal extends Component {
  @observable submitButtonDisabled = true;

  constructor(props) {
    super(props);
    const { groupsStore } = props.stores;

    this.renameHandler = new AsyncStatusCallbackHandler(
      groupsStore,
      'groupsRenameAsync',
      this.handleRenameResponse.bind(this)
    );
  }

  componentWillMount() {
    this.enableButton();
  }

  componentWillUnmount() {
    this.renameHandler();
  }

  enableButton = () => {
    this.submitButtonDisabled = false;
  };

  disableButton = () => {
    this.submitButtonDisabled = true;
  };

  submitForm = (e) => {
    if (e) e.preventDefault();
    const { stores } = this.props;
    const { groupsStore } = stores;
    const data = serialize(document.querySelector('#group-rename-form'), { hash: true });
    groupsStore.renameGroup(groupsStore.selectedGroup.id, data.groupName);
  };

  handleRenameResponse = () => {
    const { hide } = this.props;
    hide();
  };

  render() {
    const { stores, shown, hide, t } = this.props;
    const { groupsStore } = stores;
    const form = (
      <OTAForm onSubmit={this.submitForm} id="group-rename-form">
        <AsyncResponse
          handledStatus="error"
          action={groupsStore.groupsRenameAsync}
          errorMsg={groupsStore.groupsRenameAsync.data ? groupsStore.groupsRenameAsync.data.description : null}
        />
        <Row className="row">
          <Col span={16}>
            <div className="group-name-input">
              <FormInput
                onValid={this.enableButton}
                onInvalid={this.disableButton}
                name="groupName"
                className="input-wrapper"
                isEditable={!groupsStore.groupsRenameAsync.isFetching}
                title={t('groups.renaming.group_name')}
                label={t('groups.renaming.group_name')}
                placeholder={t('groups.renaming.name')}
                defaultValue={groupsStore.selectedGroup.groupName}
              />
            </div>
          </Col>
        </Row>
        <Row className="row">
          <Col span={24}>
            <div className="body-actions">
              <button
                type="submit"
                disabled={this.submitButtonDisabled || groupsStore.groupsRenameAsync.isFetching}
                className="btn-primary"
                id="add"
              >
                Edit
              </button>
            </div>
          </Col>
        </Row>
      </OTAForm>
    );
    return (
      <OTAModal
        title={<div>Rename group</div>}
        topActions={(
          <div className="top-actions flex-end">
            <div className="modal-close" onClick={hide}>
              <img src={assets.DEFAULT_CLOSE_ICON} alt="Icon" />
            </div>
          </div>
        )}
        className="create-group-modal"
        content={form}
        visible={shown}
      />
    );
  }
}

RenameModal.propTypes = {
  shown: PropTypes.bool.isRequired,
  hide: PropTypes.func.isRequired,
  stores: PropTypes.shape({}),
  t: PropTypes.func.isRequired
};

export default withTranslation()(RenameModal);
