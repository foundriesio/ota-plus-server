/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { action, observable, observe, onBecomeObserved } from 'mobx';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';
import { Loader, DependenciesModal, ConfirmationModal } from '../partials';
import SoftwareRepositoryAlpha from '../pages/SoftwareRepositoryAlpha';
import {
  SoftwareCreateModal,
  SoftwareHeader,
  SoftwareList,
  SoftwareDependenciesManager,
  SoftwareEditCommentModal
} from '../components/software';
import { ACTIVE_TAB_KEY, ADVANCED_TAB_KEY, FEATURES, SWITCH_TO_SW_REPO_KEY } from '../config';
import { MetaData } from '../utils';

@inject('stores')
@observer
class Software extends Component {
  @observable createModalShown = false;

  @observable fileUploaderModalShown = false;

  @observable fileDropped = null;

  @observable copied = false;

  @observable dependenciesModalShown = false;

  @observable dependenciesManagerShown = false;

  @observable activeVersionFilepath = null;

  @observable activeManagerVersion = null;

  @observable deleteConfirmationShown = false;

  @observable expandedPackageName = null;

  @observable itemToDelete = null;

  @observable editCommentShown = false;

  @observable activeComment = '';

  @observable activePackageFilepath = '';

  @observable switchToSWRepo = false;

  static propTypes = {
    stores: PropTypes.shape({}),
    highlightedPackage: PropTypes.string,
    history: PropTypes.shape({}),
    t: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);
    this.componentRef = React.createRef();
    this.updateHeaderTitle();
  }

  componentDidMount() {
    const { stores } = this.props;
    const { softwareStore, featuresStore } = stores;
    const { features } = featuresStore;
    if (features.includes(FEATURES.ADVANCED_SOFTWARE)) {
      this.cancelObserveTabChange = observe(softwareStore, (change) => {
        this.applyTab(change);
      });
      onBecomeObserved(this, SWITCH_TO_SW_REPO_KEY, this.resumeScope);
    }
    const { history } = this.props;
    const { state } = history.location;
    if (state && state.openWizard) {
      this.showCreateModal();
    }
  }

  componentWillUnmount() {
    if (!_.isUndefined(this.cancelObserveTabChange)) {
      this.cancelObserveTabChange();
    }
  }

  @action setActive = (tab) => {
    const { stores } = this.props;
    const { softwareStore } = stores;

    this.switchToSWRepo = tab === ADVANCED_TAB_KEY;
    softwareStore.activeTab = tab;
    this.updateHeaderTitle();
  };

  resumeScope = () => {
    const { stores } = this.props;
    const { softwareStore } = stores;

    this.setActive(softwareStore.activeTab);
  };

  applyTab = (change) => {
    const { name, newValue } = change;

    if (name === ACTIVE_TAB_KEY) {
      this.setActive(newValue);
    }
  };

  showEditComment = (filepath, comment, e) => {
    if (e) e.preventDefault();
    this.editCommentShown = true;
    this.activeComment = comment;
    this.activePackageFilepath = filepath;
  };

  hideEditComment = (e) => {
    if (e) e.preventDefault();
    this.editCommentShown = false;
    this.activeComment = '';
    this.activePackageFilepath = null;
  };

  setExpandedPackageName = (name) => {
    this.expandedPackageName = name;
    this.updateHeaderTitle();
  };

  deleteItem = (e) => {
    const { stores } = this.props;
    const { softwareStore } = stores;
    if (e) e.preventDefault();
    softwareStore.deletePackage(this.itemToDelete);
    this.hideDeleteConfirmation();
  };

  showDeleteConfirmation = (itemName, itemType, e) => {
    if (e) e.preventDefault();
    this.itemToDelete = itemName;
    this.deleteConfirmationShown = true;
  };

  hideDeleteConfirmation = (e) => {
    if (e) e.preventDefault();
    this.deleteConfirmationShown = false;
  };

  showDependenciesModal = (activeVersionFilepath, e) => {
    if (e) e.preventDefault();
    this.dependenciesModalShown = true;
    this.activeVersionFilepath = activeVersionFilepath;
  };

  hideDependenciesModal = (e) => {
    if (e) e.preventDefault();
    this.dependenciesModalShown = false;
    this.activeVersionFilepath = null;
  };

  showDependenciesManager = (activeManagerVersion, e) => {
    if (e) e.preventDefault();
    this.dependenciesManagerShown = true;
    this.activeManagerVersion = activeManagerVersion;
  };

  hideDependenciesManager = (e) => {
    if (e) e.preventDefault();
    this.dependenciesManagerShown = false;
    this.activeManagerVersion = null;
  };

  showCreateModal = (files, e) => {
    if (e) e.preventDefault();
    this.createModalShown = true;
    this.fileDropped = files ? files[0] : null;
  };

  showFileUploaderModal = (e) => {
    if (e) e.preventDefault();
    this.fileUploaderModalShown = true;
  };

  hideFileUploaderModal = (e) => {
    if (e) e.preventDefault();
    this.fileUploaderModalShown = false;
  };

  handleCopy = (e) => {
    if (e) e.preventDefault();
    this.copied = true;
  };

  hideCreateModal = (e) => {
    if (e) e.preventDefault();
    this.createModalShown = false;
    this.fileDropped = null;
  };

  onFileDrop = (files) => {
    this.showCreateModal(files);
  };

  updateHeaderTitle = () => {
    const { t } = this.props;
    if (this.switchToSWRepo) {
      this.title = t('software.advanced.title');
    } else if (this.expandedPackageName) {
      this.title = t('software.details.title');
    } else {
      this.title = t('software.title');
    }
  };

  render() {
    const { stores, highlightedPackage, t } = this.props;
    const { softwareStore } = stores;
    return (
      <span ref={this.componentRef}>
        <MetaData title={this.title}>
          {softwareStore.packagesFetchAsync.isFetching ? (
            <div className="wrapper-center">
              <Loader />
            </div>
          ) : softwareStore.packagesCount ? (
            <div className="packages-container">
              <SoftwareHeader showCreateModal={this.showCreateModal} switchToSWRepo={this.switchToSWRepo} />
              {!this.switchToSWRepo ? (
                <SoftwareList
                  onFileDrop={this.onFileDrop}
                  highlightedPackage={highlightedPackage}
                  showDependenciesModal={this.showDependenciesModal}
                  showDependenciesManager={this.showDependenciesManager}
                  showDeleteConfirmation={this.showDeleteConfirmation}
                  expandedPackageName={this.expandedPackageName}
                  setExpandedPackageName={this.setExpandedPackageName}
                  showEditComment={this.showEditComment}
                />
              ) : (
                <SoftwareRepositoryAlpha />
              )}
            </div>
          ) : (
            <div className="wrapper-center">
              <div className="page-intro">
                <div>
                  <img src="/assets/img/icons/white/packages.svg" alt="Icon" />
                </div>
                <div>{t('software.empty.no_software')}</div>
                <div>
                  <a
                    href="#"
                    className="add-button light"
                    id="add-new-software"
                    onClick={this.showCreateModal.bind(this, null)}
                  >
                    <span>{t('software.empty.add_new')}</span>
                  </a>
                </div>
              </div>
            </div>
          )}
          {this.createModalShown && (
          <SoftwareCreateModal
            shown={this.createModalShown}
            hide={this.hideCreateModal}
            fileDropped={this.fileDropped}
          />
          )}
          {this.deleteConfirmationShown && (
            <ConfirmationModal
              modalTitle={(
                <div className="text-red" id="delete-software-title">
                  {t('software.action_buttons.delete_software')}
                </div>
              )}
              shown={this.deleteConfirmationShown}
              hide={this.hideDeleteConfirmation}
              deleteItem={this.deleteItem}
              topText={(
                <div className="delete-modal-top-text" id="delete-software-top-text">
                  {t('software.delete_soft_version.top_text.p1')}
                  <b id={`delete-software-${this.expandedPackageName}`}>{this.expandedPackageName}</b>
                  {t('software.delete_soft_version.top_text.p2')}
                  <b id={`delete-software-${this.expandedPackageName}-version-${this.itemToDelete}`}>
                    {this.itemToDelete}
                  </b>
                  {t('software.delete_soft_version.top_text.p3')}
                </div>
              )}
              bottomText={(
                <div className="delete-modal-bottom-text" id="delete-software-bottom-text">
                  {t('software.delete_soft_version.bottom_text')}
                </div>
              )}
              showDetailedInfo
            />
          )}
          {this.dependenciesModalShown && (
            <DependenciesModal
              shown={this.dependenciesModalShown}
              hide={this.hideDependenciesModal}
              activeItemName={this.activeVersionFilepath}
            />
          )}
          {this.dependenciesManagerShown && (
            <SoftwareDependenciesManager
              shown={this.dependenciesManagerShown}
              hide={this.hideDependenciesManager}
              packages={softwareStore.preparedPackages}
              activePackage={this.activeManagerVersion}
            />
          )}
          {this.editCommentShown && (
            <SoftwareEditCommentModal
              shown={this.editCommentShown}
              hide={this.hideEditComment}
              comment={this.activeComment}
              filepath={this.activePackageFilepath}
            />
          )}
        </MetaData>
      </span>
    );
  }
}

export default withTranslation()(withRouter(Software));
