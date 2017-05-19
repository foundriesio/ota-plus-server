import React, { PropTypes, Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Loader } from '../partials';
import { resetAsync } from '../utils/Common';
import { 
    CampaignsHeader,
    CampaignsTooltip, 
    CampaignsCreateModal, 
    CampaignsRenameModal,
    CampaignsListItem,
    CampaignsWizard
} from '../components/campaigns';
import { FlatButton } from 'material-ui';
import _ from 'underscore';

@observer
class Campaigns extends Component {
    @observable tooltipShown = false;
    @observable createModalShown = false;
    @observable renameModalShown = false;
    @observable campaignIdToAction = null;
    @observable wizardShown = false;

    constructor(props) {
        super(props);
        this.showTooltip = this.showTooltip.bind(this);
        this.hideTooltip = this.hideTooltip.bind(this);
        this.showCreateModal = this.showCreateModal.bind(this);
        this.hideCreateModal = this.hideCreateModal.bind(this);
        this.showRenameModal = this.showRenameModal.bind(this);
        this.hideRenameModal = this.hideRenameModal.bind(this);
        this.showWizard = this.showWizard.bind(this);
        this.hideWizard = this.hideWizard.bind(this);
        this.goToDetails = this.goToDetails.bind(this);
        this.changeSort = this.changeSort.bind(this);
        this.changeFilter = this.changeFilter.bind(this);
    }
    showTooltip(e) {
        if(e) e.preventDefault();
        this.tooltipShown = true;
    }
    hideTooltip(e) {
        if(e) e.preventDefault();
        this.tooltipShown = false;
    }
    showCreateModal(e) {
        if(e) e.preventDefault();
        this.createModalShown = true;
    }
    hideCreateModal(createdCampaignId, e) {
        if(e) e.preventDefault();
        this.createModalShown = false;
        if(createdCampaignId) {
            resetAsync(this.props.campaignsStore.campaignsCreateAsync);
            this.showWizard(createdCampaignId);
        }
    }
    showRenameModal(campaignId, e) {
        if(e) e.preventDefault();
        this.renameModalShown = true;
        this.campaignIdToAction = campaignId;
    }
    hideRenameModal(e) {
        if(e) e.preventDefault();
        this.renameModalShown = false;
        this.campaignIdToAction = null;
        resetAsync(this.props.campaignsStore.campaignsRenameAsync);
    }
    showWizard(campaignId, e) {
        if(e) e.preventDefault();
        this.wizardShown = true;
        this.campaignIdToAction = campaignId;
    }
    hideWizard(e) {
        if(e) e.preventDefault();
        this.wizardShown = false;
        this.campaignIdToAction = null;
    }
    goToDetails(campaignId, e) {
        this.context.router.push(`/campaign/${campaignId}`);
    }
    changeSort(sort, e) {
        if(e) e.preventDefault();
        this.props.campaignsStore._prepareCampaigns(this.props.campaignsStore.campaignsFilter, sort);
    }
    changeFilter(filter) {
        this.props.campaignsStore._prepareCampaigns(filter, this.props.campaignsStore.campaignsSort);
    }
    render() {
        const { campaignsStore, packagesStore, groupsStore } = this.props;
        return (
            <span>
                {campaignsStore.overallCampaignsCount === null && campaignsStore.campaignsFetchAsync.isFetching ?
                    <div className="wrapper-center">
                        <Loader />
                    </div>
                :
                    campaignsStore.overallCampaignsCount ? 
                        <span>
                            <CampaignsHeader
                                showCreateModal={this.showCreateModal}
                                campaignsSort={campaignsStore.campaignsSort}
                                changeSort={this.changeSort}
                                campaignsFilter={campaignsStore.campaignsFilter}
                                changeFilter={this.changeFilter}
                            />
                            {campaignsStore.preparedCampaigns.length ?
                                <span className="content-container">
                                    <div className="section-header">
                                        Draft campaigns
                                    </div>
                                    <div className="campaigns-list draft">
                                        {campaignsStore.draftCampaigns.length ?
                                            <span>
                                                <div className="heading">
                                                    <div></div>
                                                    <div className="column">Name</div>
                                                    <div className="column">Start date</div>
                                                    <div className="column">End date</div>
                                                    <div className="column"></div>
                                                    <div className="column"></div>
                                                </div>
                                                {_.map(campaignsStore.draftCampaigns, (campaign) => {
                                                    return (
                                                        <CampaignsListItem 
                                                            goToDetails={this.goToDetails}
                                                            showWizard={this.showWizard}
                                                            showRenameModal={this.showRenameModal}
                                                            campaign={campaign}
                                                            type="draft"
                                                            key={campaign.id}
                                                        />
                                                    );
                                                })}
                                            </span>
                                        :
                                            <div className="empty">
                                                No draft campaigns.
                                            </div>
                                        }
                                    </div>
                                    <div className="section-header">
                                        Running campaigns
                                    </div>
                                    <div className="campaigns-list">
                                        {campaignsStore.activeCampaigns.length ?
                                            <span>
                                                <div className="heading">
                                                    <div></div>
                                                    <div className="column">Name</div>
                                                    <div className="column">Start date</div>
                                                    <div className="column">End date</div>
                                                    <div className="column">Status</div>
                                                    <div className="column"></div>
                                                </div>
                                                {_.map(campaignsStore.activeCampaigns, (campaign) => {
                                                    return (
                                                        <CampaignsListItem 
                                                            goToDetails={this.goToDetails}
                                                            showWizard={this.showWizard}
                                                            showRenameModal={this.showRenameModal}
                                                            campaign={campaign}
                                                            type="active"
                                                            key={campaign.id}
                                                        />
                                                    );
                                                })}
                                            </span>
                                        :
                                            <div className="empty">
                                                No running campaigns.
                                            </div>
                                        }
                                    </div>
                                    <div className="section-header">
                                        Finished campaigns
                                    </div>
                                    <div className="campaigns-list">
                                        {campaignsStore.finishedCampaigns.length ?
                                            <span>
                                                <div className="heading">
                                                    <div></div>
                                                    <div className="column">Name</div>
                                                    <div className="column">Start date</div>
                                                    <div className="column">End date</div>
                                                    <div className="column">Status</div>
                                                    <div className="column"></div>
                                                </div>
                                                {_.map(campaignsStore.finishedCampaigns, (campaign) => {
                                                    return (
                                                        <CampaignsListItem 
                                                            goToDetails={this.goToDetails}
                                                            showWizard={this.showWizard}
                                                            showRenameModal={this.showRenameModal}
                                                            campaign={campaign}
                                                            type="finished"
                                                            key={campaign.id}
                                                        />
                                                    );
                                                })}
                                            </span>
                                        :
                                            <div className="empty">
                                                No finished campaigns.
                                            </div>
                                        }
                                    </div>
                                </span>
                            : 
                                <span className="content-empty">
                                    <div className="wrapper-center">
                                        No matching campaigns found.
                                    </div>
                                </span>
                            }
                        </span>
                    :
                        <div className="wrapper-center">
                            <div className="page-intro">
                                <div>You haven't created any update campaigns yet.</div>
                                <div>
                                    <FlatButton
                                        label="Add new campaign"
                                        type="button"
                                        className="btn-main"
                                        onClick={this.showCreateModal}
                                    />
                                </div>
                                <a href="#" onClick={this.showTooltip}>What is this?</a>
                            </div>
                        </div>
                }
                <CampaignsTooltip 
                    shown={this.tooltipShown}
                    hide={this.hideTooltip}
                />
                <CampaignsCreateModal 
                    shown={this.createModalShown}
                    hide={this.hideCreateModal}
                    campaignsStore={campaignsStore}
                />
                <CampaignsRenameModal 
                    shown={this.renameModalShown}
                    hide={this.hideRenameModal}
                    campaignsStore={campaignsStore}
                    campaignId={this.campaignIdToAction}
                />
                <CampaignsWizard 
                    shown={this.wizardShown}
                    hide={this.hideWizard}
                    campaignsStore={campaignsStore}
                    packagesStore={packagesStore}
                    groupsStore={groupsStore}
                    campaignId={this.campaignIdToAction}
                />
            </span>
        );
    }
}

Campaigns.contextTypes = {
    router: React.PropTypes.object.isRequired
}

Campaigns.propTypes = {
    campaignsStore: PropTypes.object.isRequired,
    packagesStore: PropTypes.object.isRequired,
    groupsStore: PropTypes.object.isRequired
}

export default Campaigns;