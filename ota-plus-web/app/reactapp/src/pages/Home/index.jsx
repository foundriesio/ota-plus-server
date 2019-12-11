/** @format */

import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useObserver } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { useStores } from '../../stores/hooks';
import { MetaData, FadeAnimation } from '../../utils';
import { SanityCheckContainer, Terms } from '../../containers';
import { Loader } from '../../partials';
import DashboardStepper from '../../components/dashboard/new/DashboardStepper';
import DocsLinks from '../../components/dashboard/new/DocsLinks';
import { HomeWrapper, LoadingIcon } from './styled';

function useStoreData() {
  const { stores } = useStores();
  return useObserver(() => ({
    campaignsStore: stores.campaignsStore,
    devicesStore: stores.devicesStore,
    groupsStore: stores.groupsStore,
    softwareStore: stores.softwareStore,
    updatesStore: stores.updatesStore,
    provisioningStore: stores.provisioningStore,
    sanityCheckCompleted: stores.provisioningStore.sanityCheckCompleted,
    userStore: stores.userStore
  }));
}

const Home = ({ uiAutoFeatureActivation, uiUserProfileMenu }) => {
  const [isStepperLoading, setIsStepperLoading] = useState(true);
  const {
    campaignsStore,
    devicesStore,
    groupsStore,
    softwareStore,
    updatesStore,
    provisioningStore,
    sanityCheckCompleted,
    userStore,
  } = useStoreData();

  useEffect(() => {
    async function fetchAll() {
      await Promise.all([
        devicesStore.fetchDevicesStats(),
        devicesStore.fetchNotSeenRecentlyDevices(),
        devicesStore.fetchUngroupedDevices(),
        softwareStore.fetchPackages(),
        groupsStore.fetchGroupStats(),
        updatesStore.fetchUpdates(),
        campaignsStore.fetchCampaignsStats(),
        campaignsStore.fetchCampaignsWithErrors(),
      ]);
      setIsStepperLoading(false);
    }
    if (!uiAutoFeatureActivation) {
      provisioningStore.sanityCheckCompleted = true;
    }
    if (uiUserProfileMenu) {
      provisioningStore.namespaceSetup();
    }
    fetchAll();
  }, []);

  const isTermsAccepted = userStore.isTermsAccepted();
  const contractsCheckCompleted = userStore.contractsCheckCompleted();

  const { t } = useTranslation();

  const renderDashboard = (
    <MetaData title={t('navigation.home')}>
      <HomeWrapper>
        {isStepperLoading
          ? <LoadingIcon type="loading" spin />
          : <DashboardStepper />}
        <DocsLinks />
      </HomeWrapper>
    </MetaData>
  );

  const renderLoader = (
    <div className="wrapper-center">
      <Loader />
    </div>
  );

  return (
    <FadeAnimation display="flex">
      {uiUserProfileMenu
        ? isTermsAccepted
          ? sanityCheckCompleted
            ? renderDashboard
            : provisioningStore.namespaceSetupFetchAsync.isFetching
              ? renderLoader
              : <SanityCheckContainer />
          : userStore.contractsFetchAsync.isFetching
            ? renderLoader
            : (contractsCheckCompleted ? <Terms /> : renderLoader)
        : renderDashboard
      }
    </FadeAnimation>
  );
};

Home.propTypes = {
  uiAutoFeatureActivation: PropTypes.bool,
  uiUserProfileMenu: PropTypes.bool
};

export default Home;