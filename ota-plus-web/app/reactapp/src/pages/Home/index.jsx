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
import BuildTeam from '../../components/dashboard/new/BuildTeam';
import RecentActivity from '../../components/dashboard/new/RecentActivity';
import { ANALYTICS_VIEW_HOMEPAGE } from '../../constants/analyticsViews';
import { setAnalyticsView } from '../../helpers/analyticsHelper';
import { GridContainer, HomeWrapper, LoadingIcon } from './styled';

function useStoreData() {
  const { stores } = useStores();
  return useObserver(() => ({
    campaignsStore: stores.campaignsStore,
    devicesStore: stores.devicesStore,
    groupsStore: stores.groupsStore,
    softwareStore: stores.softwareStore,
    updatesStore: stores.updatesStore,
    provisioningStore: stores.provisioningStore,
    recentlyCreatedStore: stores.recentlyCreatedStore,
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
    recentlyCreatedStore,
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
        recentlyCreatedStore.fetchRecentlyCreated()
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
    setAnalyticsView(ANALYTICS_VIEW_HOMEPAGE);
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
        <GridContainer>
          <RecentActivity />
          <div>
            <BuildTeam />
            <DocsLinks />
          </div>
        </GridContainer>
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
