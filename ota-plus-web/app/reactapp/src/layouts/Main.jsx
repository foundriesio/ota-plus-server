import React, { Component, PropTypes } from 'react';
import axios from 'axios';
import { observe, observable, extendObservable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { translate } from 'react-i18next';
import { APP_LAYOUT } from '../config';
import { 
    Navigation,
    SizeVerify,
    UploadBox 
} from '../partials';
import { 
    FadeAnimation, 
    WebsocketHandler,
} from '../utils';
import _ from 'underscore';
import Cookies from 'js-cookie';
import Wizard from '../components/campaigns/Wizard';
import { doLogout } from '../utils/Common';

@inject('stores')
@observer
class Main extends Component {
    @observable termsAndConditionsAccepted = false;
    @observable numOfWizards = 0;
    @observable wizards = [];    
    @observable minimizedWizards = [];
    @observable uploadBoxMinimized = false;
    @observable uiAutoFeatureActivation = document.getElementById('toggle-autoFeatureActivation').value === "true";
    @observable uiUserProfileMenu = document.getElementById('toggle-userProfileMenu').value === "true";
    @observable uiUserProfileEdit = document.getElementById('toggle-userProfileEdit').value === "true";
    @observable uiCredentialsDownload = document.getElementById('toggle-credentialsDownload').value === "true";
    @observable atsGarageTheme = document.getElementById('toggle-atsGarageTheme').value === 'true';
    @observable switchToSWRepo = false;

    constructor(props) {
        super(props);
        axios.defaults.headers.common['Csrf-Token'] = document.getElementById('csrf-token-val').value;
        axios.interceptors.response.use(null, (error) => {
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                this.callFakeWsHandler();
                doLogout();
            }
            return Promise.reject(error);
        });
        this.backButtonAction = this.backButtonAction.bind(this);
        this.toggleUploadBoxMode = this.toggleUploadBoxMode.bind(this);
        
        this.callFakeWsHandler = this.callFakeWsHandler.bind(this);
        this.toggleSWRepo = this.toggleSWRepo.bind(this);
        this.toggleFleet = this.toggleFleet.bind(this);
        this.locationChange = this.locationChange.bind(this);

        this.addNewWizard = this.addNewWizard.bind(this);
        this.hideWizard = this.hideWizard.bind(this);
        this.toggleWizard = this.toggleWizard.bind(this);

        const { 
            devicesStore, 
            packagesStore, 
            hardwareStore, 
            campaignsStore, 
            groupsStore, 
            userStore
        } = props.stores;
        this.websocketHandler = new WebsocketHandler(document.getElementById('ws-url').value, {
            devicesStore: devicesStore,
            packagesStore: packagesStore,
            hardwareStore: hardwareStore,
            campaignsStore: campaignsStore,
            groupsStore: groupsStore,
        });
        this.logoutHandler = observe(userStore, (change) => {
            if(change.name === 'ifLogout' && change.object[change.name]) {
                this.callFakeWsHandler();
                doLogout();
            }
        });
    }
    toggleWizard(wizardId, wizardName, e) {
        if(e) e.preventDefault();
        const { 
            packagesStore, 
        } = this.props.stores;
        let minimizedWizard = {
            id: wizardId,
            name: wizardName
        };
        let wizardAlreadyMinimized = _.find(this.minimizedWizards, {id: wizardId});
        if(wizardAlreadyMinimized) {
            this.minimizedWizards.splice(_.findIndex(this.minimizedWizards, { id: wizardId }), 1);
            packagesStore.fetchPackages('packagesSafeFetchAsync');
        }
        else
            this.minimizedWizards.push(minimizedWizard);
    }
    addNewWizard(skipStep = null) {
        const { 
            campaignsStore, 
            packagesStore,
            groupsStore,
            hardwareStore,
            featuresStore
        } = this.props.stores;
        const wizard =
            <Wizard
                campaignsStore={campaignsStore}
                packagesStore={packagesStore}
                groupsStore={groupsStore}
                hardwareStore={hardwareStore}
                wizardIdentifier={this.wizards.length}
                hideWizard={this.hideWizard}
                toggleWizard={this.toggleWizard}
                minimizedWizards={this.minimizedWizards}
                skipStep={skipStep}
                key={this.wizards.length}
            />;
        this.wizards = this.wizards.concat(wizard);
    }
    hideWizard(wizardIdentifier, e) {
        const { 
            campaignsStore           
        } = this.props.stores;
        if(e) e.preventDefault();
        this.wizards = _.filter(this.wizards, wizard => parseInt(wizard.key, 10) !== parseInt(wizardIdentifier, 10));
        this.minimizedWizards.splice(_.findIndex(this.minimizedWizards, { id: wizardIdentifier }), 1);
        campaignsStore._resetFullScreen();
    }
    callFakeWsHandler() {
        const { 
            devicesStore, 
            packagesStore,
            hardwareStore,
            campaignsStore,
            groupsStore
        } = this.props.stores;
        let wsUrl = document.getElementById('ws-url').value.replace('bearer', 'logout');
        this.fakeWebsocketHandler = new WebsocketHandler(wsUrl, {
            devicesStore: devicesStore,
            packagesStore: packagesStore,
            hardwareStore: hardwareStore,
            campaignsStore: campaignsStore,
            groupsStore: groupsStore,
        });
        this.fakeWebsocketHandler.init();
    }
    componentWillMount() {
        const { 
            userStore, 
            featuresStore,
        } = this.props.stores;
        if(this.uiUserProfileMenu) {
            userStore.fetchUser();
            userStore.fetchContracts();
            featuresStore.fetchFeatures();
        }        
        this.websocketHandler.init();
        window.atsGarageTheme = this.atsGarageTheme;
        this.context.router.listen(this.locationChange);
    }
    locationChange() {
        const { 
            userStore, 
        } = this.props.stores;
        if(!userStore._isTermsAccepted() && !this.context.router.isActive('/')) {
            this.context.router.push('/');
        }
    }
    toggleUploadBoxMode(e) {
        if(e) e.preventDefault();
        this.uploadBoxMinimized = !this.uploadBoxMinimized;
    }
    toggleSWRepo() {
        this.switchToSWRepo = !this.switchToSWRepo;
    }    
    componentWillUnmount() {
        this.logoutHandler();
    }
    backButtonAction(e) {
        if(e) e.preventDefault();
        window.history.go(-1);
    }
    toggleFleet(fleet, selectFirst = false, e) {
        const { 
            groupsStore,
            devicesStore 
        } = this.props.stores;
        if(e) e.preventDefault();
        groupsStore.activeFleet = fleet;
        groupsStore._filterGroups(fleet.id);
        if(selectFirst) {
            const firstGroup = _.first(groupsStore.filteredGroups);
            if(firstGroup) {
                groupsStore.selectedGroup = {
                    type: 'real',
                    groupName: firstGroup.groupName, 
                    id: firstGroup.id
                };
                devicesStore.fetchDevices(devicesStore.devicesFilter, firstGroup.id);
            } else {
                groupsStore.selectedGroup = {
                    type: 'artificial',
                    groupName: 'all'
                };
                devicesStore.fetchDevices(devicesStore.devicesFilter, null);
            }
        }
    }
    render() {
        const { children, ...rest } = this.props;
        const pageId = "page-" + (this.props.location.pathname.toLowerCase().split('/')[1] || "home");
        const { 
            featuresStore,
            packagesStore
        } = this.props.stores;
        return (
            <span>
                <Navigation
                    location={pageId}
                    toggleSWRepo={this.toggleSWRepo}
                    uiUserProfileEdit={this.uiUserProfileEdit}
                    switchToSWRepo={this.switchToSWRepo}
                    uiUserProfileMenu={this.uiUserProfileMenu}
                    uiCredentialsDownload={this.uiCredentialsDownload}
                    toggleFleet={this.toggleFleet}
                />
                <div id={pageId} style={{
                    height: featuresStore.alphaPlusEnabled && (pageId === 'page-packages' || pageId === 'page-devices') ? 'calc(100vh - 100px)' : 'calc(100vh - 50px)',
                    padding: !featuresStore.alphaPlusEnabled && pageId === 'page-packages' ? '30px' : ''
                }}>
                    <FadeAnimation>                    
                        <children.type
                            {...rest}
                            children={children.props.children}
                            backButtonAction={this.backButtonAction}
                            addNewWizard={this.addNewWizard}
                            uiUserProfileEdit={this.uiUserProfileEdit}
                            switchToSWRepo={this.switchToSWRepo}
                            uiAutoFeatureActivation={this.uiAutoFeatureActivation}
                            uiUserProfileMenu={this.uiUserProfileMenu}
                            uiCredentialsDownload={this.uiCredentialsDownload}
                            toggleFleet={this.toggleFleet}
                        />
                    </FadeAnimation>
                    <SizeVerify 
                        minWidth={1280}
                        minHeight={768}
                    />
                    <UploadBox 
                        // packagesStore={this.packagesStore}
                        minimized={this.uploadBoxMinimized}
                        toggleUploadBoxMode={this.toggleUploadBoxMode}
                    />
                    {this.wizards}
                    <div className="minimized">
                        {this.uploadBoxMinimized ?
                            <div className="minimized__box">
                                <div className="minimized__name">
                                    Uploading {this.props.t('common.packageWithCount', {count: packagesStore.packagesUploading.length})}
                                </div>
                                <div className="minimized__actions">
                                    <a href="#" id="maximize-upload-box" title="Maximize upload box" onClick={this.toggleUploadBoxMode.bind(this)}>
                                        <img src="/assets/img/icons/reopen.svg" alt="Icon" />
                                    </a>
                                </div>
                            </div>
                        :
                            null
                        }
                        {_.map(this.minimizedWizards, (wizard, index) => {
                            return (
                                <div className="minimized__box" key={index}>
                                    <div className="minimized__name">
                                        {wizard.name ?
                                            <span>
                                                {wizard.name}
                                            </span>
                                        :
                                            <span>
                                                Choose name
                                            </span>
                                        }
                                    </div>
                                    <div className="minimized__actions">
                                        <a href="#" id="maximize-wizard" title="Maximize wizard" onClick={this.toggleWizard.bind(this, wizard.id, wizard.name)} >
                                            <img src="/assets/img/icons/reopen.svg" alt="Icon" />
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </span>
        );
    }
    
}

Main.wrappedComponent.contextTypes = {
    router: React.PropTypes.object.isRequired
}

Main.propTypes = {
    children: PropTypes.object.isRequired
}

export default translate()(Main);
