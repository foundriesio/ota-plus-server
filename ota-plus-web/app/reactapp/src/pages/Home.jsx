import React, { Component, PropTypes } from 'react';
import { observe, observable } from 'mobx';
import { observer } from 'mobx-react';
import { MetaData, FadeAnimation, AsyncStatusCallbackHandler } from '../utils';
import { HomeContainer, SanityCheckContainer, Terms } from '../containers';
import { Loader } from '../partials';

const title = "Home";

@observer
class Home extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        const { uiAutoFeatureActivation } = this.props;
        if (!uiAutoFeatureActivation) {
           this.props.provisioningStore.sanityCheckCompleted = true;
        }
        this.props.provisioningStore.namespaceSetup();
        this.props.devicesStore.fetchDevices();
        this.props.packagesStore.fetchPackages();
        this.props.campaignsStore.fetchCampaigns();
    }
    componentWillUnmount() {
        this.props.devicesStore._reset();
        this.props.packagesStore._reset();
        this.props.campaignsStore._reset();
    }
    render() {
        const { 
            devicesStore,
            packagesStore,
            campaignsStore,
            hardwareStore,
            userStore,
            provisioningStore,
            featuresStore,
            uiUserProfileMenu,
            setTermsAccepted,
            termsAccepted,
        } = this.props;
        return (
            <FadeAnimation
                display="flex">
                {termsAccepted() ?
                    provisioningStore.sanityCheckCompleted ?
                        <MetaData
                            title={title}>
                            <HomeContainer
                                devicesStore={devicesStore}
                                packagesStore={packagesStore}
                                campaignsStore={campaignsStore}
                                hardwareStore={hardwareStore}
                            />
                        </MetaData>
                    : provisioningStore.namespaceSetupFetchAsync.isFetching ?
                        <div className="wrapper-center">
                            <Loader />
                        </div>
                    :
                        <SanityCheckContainer
                            provisioningStore={provisioningStore}
                            proceed={this.proceed}
                        />            
                : 
                    <Terms
                        userStore={userStore}
                        setTermsAccepted={setTermsAccepted}
                    />
                }
            </FadeAnimation>
        );
    }
}

Home.propTypes = {
    devicesStore: PropTypes.object,
    hardwareStore: PropTypes.object,
    packagesStore: PropTypes.object,
    campaignsStore: PropTypes.object,
    userStore: PropTypes.object,
    provisioningStore: PropTypes.object,
    featuresStore: PropTypes.object,
}

export default Home;