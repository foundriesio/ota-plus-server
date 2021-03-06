/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';

import Loader from '../../../partials/Loader';
import CampaignsWizardUpdateList from './step3Files/CampaignsWizardUpdateList';
import { sendAction } from '../../../helpers/analyticsHelper';
import { OTA_CAMPAIGNS_CHECKS_UPDATE } from '../../../constants/analyticsActions';

@inject('stores')
@observer
class WizardStep3 extends Component {
  static propTypes = {
    stores: PropTypes.shape({}),
    wizardData: PropTypes.shape({}),
    markStepAsFinished: PropTypes.func.isRequired,
    markStepAsNotFinished: PropTypes.func.isRequired,
    showUpdateDetails: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired
  };

  componentDidMount() {
    const { stores, wizardData } = this.props;
    const { updatesStore, softwareStore } = stores;
    const selectedGroupIds = wizardData.groups.map(group => group.id);
    updatesStore.fetchWizardUpdates(selectedGroupIds);
    softwareStore.fetchPackages();
  }

  validateStep = (selectedUpdate) => {
    const { markStepAsFinished, markStepAsNotFinished } = this.props;
    const stepFinished = selectedUpdate && selectedUpdate.length === 1;

    if (stepFinished) {
      markStepAsFinished();
    } else {
      markStepAsNotFinished();
    }
  };

  toggleUpdate = (selected) => {
    const { wizardData } = this.props;
    const { update } = wizardData;

    if (_.isEmpty(update)) {
      update.push(selected);
    } else {
      update.pop();
    }

    this.validateStep(update);
  };

  showDetails = (update, mouseEvent) => {
    const { showUpdateDetails } = this.props;
    if (mouseEvent) mouseEvent.preventDefault();
    sendAction(OTA_CAMPAIGNS_CHECKS_UPDATE);
    showUpdateDetails(update);
  };

  render() {
    const { stores, wizardData, t } = this.props;
    const { updatesStore } = stores;
    const { update: selectedUpdate } = wizardData;

    return updatesStore.updatesWizardFetchAsync.isFetching ? (
      <div className="wrapper-center">
        <Loader />
      </div>
    ) : (
      <div>
        <span className="c-form__label">{t('campaigns.wizard.select_update_configuration')}</span>
        <CampaignsWizardUpdateList
          selectedUpdate={selectedUpdate}
          stepId={2}
          toggleSelection={this.toggleUpdate}
          showUpdateDetails={this.showDetails}
        />
      </div>
    );
  }
}

export default withTranslation()(WizardStep3);
