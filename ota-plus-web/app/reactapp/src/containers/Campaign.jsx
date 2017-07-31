import React, { PropTypes, Component } from 'react';
import { observable } from 'mobx';
import { observer } from 'mobx-react';
import { Loader } from '../partials';
import { resetAsync } from '../utils/Common';
import { CampaignGroupsList, CampaignCancelCampaignModal, CampaignCancelGroupModal } from '../components/campaign';
import { Doughnut } from 'react-chartjs';
import { FlatButton } from 'material-ui';
import { translate } from 'react-i18next';
import _ from 'underscore';

const AUTO_REFRESH_TIME = 10000;

@observer
class Campaign extends Component {
    @observable cancelCampaignModalShown = false;
    @observable cancelGroupModalShown = false;
    @observable updateRequestToCancel = {};

    constructor(props) {
        super(props);
        this.showCancelCampaignModal = this.showCancelCampaignModal.bind(this);
        this.hideCancelCampaignModal = this.hideCancelCampaignModal.bind(this);
        this.showCancelGroupModal = this.showCancelGroupModal.bind(this);
        this.hideCancelGroupModal = this.hideCancelGroupModal.bind(this);
        this.autoRefresh = this.autoRefresh.bind(this);
        setTimeout(this.autoRefresh, AUTO_REFRESH_TIME);
    }

    autoRefresh() {
        if(!_.isEmpty(this.props.campaignsStore.campaign) &&
            (this.props.campaignsStore.campaign.statistics.status === "prepared" || this.props.campaignsStore.campaign.statistics.status === "scheduled")) {
            this.props.campaignsStore.fetchCampaign(this.props.campaignsStore.campaign.id);
            setTimeout(this.autoRefresh, AUTO_REFRESH_TIME);
        }
    }

    showCancelCampaignModal(e) {
        if(e) e.preventDefault();
        this.cancelCampaignModalShown = true;
    }
    hideCancelCampaignModal(e) {
        if(e) e.preventDefault();
        this.cancelCampaignModalShown = false;
        resetAsync(this.props.campaignsStore.campaignsCancelAsync);
    }
    showCancelGroupModal(updateRequest, e) {
        if(e) e.preventDefault();
        this.cancelGroupModalShown = true;
        this.updateRequestToCancel = updateRequest;
    }
    hideCancelGroupModal(e) {
        if(e) e.preventDefault();
        this.cancelGroupModalShown = false;
        this.updateRequestToCancel = {};
        resetAsync(this.props.campaignsStore.campaignsCancelRequestAsync);
    }
    render() {
        const { campaignsStore, groupsStore, overallStatistics } = this.props;
        const progress = Math.min(Math.round(overallStatistics.finished/Math.max(overallStatistics.affected, 1) * 100), 100);
        const failureRateData = [
            {
                value: overallStatistics.failed,
                color: "#FE0001",
                highlight: "#FE0001",
                label: "Failure rate"
            },
            {
                value: overallStatistics.finished,
                color: "#83D060",
                highlight: "#83D060",
                label: "Success rate"
            },
            {
                value: 0,
                color: "#CCCCCC",
                highlight: "#CCCCCC",
                label: "Cancelled rate"
            }
        ];

        return (
            <span>
                {campaignsStore.campaignsOneFetchAsync.isFetching || campaignsStore.campaignsOneStatisticsFetchAsync.isFetching || groupsStore.groupsFetchAsync.isFetching ?
                    <div className="wrapper-center white-bg">
                        <Loader />
                    </div>
            :
                    <span>
                        <div className="subcontent">
                            <div className="col-xs-2 campaign-name-block">
                                <span className="campaign-name">
                                    {
                                        !campaignsStore.campaignsOneFetchAsync.isFetching && !campaignsStore.campaignsOneStatisticsFetchAsync.isFetching ?
                                            campaignsStore.campaign.name
                                        :
                                            ""
                                    }
                                </span>
                            </div>
                            <div className="col-xs-8">
                                <div className="row">
                                    <div className="col-xs-12 section-title">
                                        Total progress
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-xs-2 devices-stats">
                                        <div id="campaign-detail-devices-stats-processed" className="stat-big-count">
                                            {overallStatistics.processed}
                                        </div>
                                        <div className="stat-small-title">
                                            Processed
                                        </div>
                                    </div>
                                    <div className="col-xs-2 devices-stats">
                                        <div id="campaign-detail-devices-stats-affected" className="stat-big-count">
                                            {overallStatistics.affected}
                                        </div>
                                        <div className="stat-small-title">
                                            Affected
                                        </div>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="total-progress col-xs-12">
                                        <div className="devices-progress">
                                            <div className="progress progress-blue">
                                                <div className={"progress-bar" + (progress != 100 ? ' progress-bar-striped active': '')} role="progressbar" style={{width: progress + '%'}}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xs-12 status-block">
                                        <div className="row status-row">
                                            <div className="col-xs-4">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <span className="status failure">Failure</span>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <span className="status-value">{overallStatistics.failed}/{overallStatistics.processed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-4">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <span className="status not-impacted">Not impacted</span>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <span className="status-value">{overallStatistics.notImpacted}/{overallStatistics.processed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row status-row">
                                            <div className="col-xs-4">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <span className="status successed">Successful</span>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <span className="status-value">{overallStatistics.successful}/{overallStatistics.processed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-xs-4">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <span className="status not-proceed">Not proceed</span>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <span className="status-value">0/{overallStatistics.processed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row status-row">
                                            <div className="col-xs-4">
                                                <div className="row">
                                                    <div className="col-xs-6">
                                                        <span className="status queued">Queued</span>
                                                    </div>
                                                    <div className="col-xs-6">
                                                        <span className="status-value">{overallStatistics.queued}/{overallStatistics.processed}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="col-xs-2">
                                <span className="section-title">
                                    Failure rate
                                </span>
                                <div className="total-failure-rate" id="campaign-detail-total-failure-rate">
                                    <Doughnut 
                                        data={failureRateData} 
                                        options={{percentageInnerCutout: 40, showTooltips: false}}
                                        width="140"
                                        height="140"
                                    />
                                    <div className="rate">
                                        {Math.round(overallStatistics.failed/Math.max(overallStatistics.finished, 1) * 100)}%
                                    </div>
                                </div>
                            </div>
                            <CampaignGroupsList 
                                showCancelGroupModal={this.showCancelGroupModal}
                                campaignsStore={campaignsStore}
                                groupsStore={groupsStore}
                            />
                            <div>
                                {campaignsStore.campaign.statistics.status !== 'cancelled' ?
                                    <FlatButton
                                        label="Cancel all"
                                        title="Cancel the Campaign for all groups"
                                        type="button"
                                        onClick={this.showCancelCampaignModal}
                                        className="btn-main btn-red"
                                        id="campaign-detail-cancel-all"
                                    />
                                : 
                                    null
                                }
                            </div>
                        </div>

                    </span>
                }
                <CampaignCancelCampaignModal
                    shown={this.cancelCampaignModalShown}
                    hide={this.hideCancelCampaignModal}
                    campaignsStore={campaignsStore}
                    campaign={campaignsStore.campaign}
                    overallStatistics={overallStatistics}
                />
                <CampaignCancelGroupModal
                    shown={this.cancelGroupModalShown}
                    hide={this.hideCancelGroupModal}
                    campaign={campaignsStore.campaign}
                    campaignsStore={campaignsStore}
                    updateRequest={this.updateRequestToCancel}
                />
            </span>
        );
    }
}

Campaign.propTypes = {
    campaignsStore: PropTypes.object.isRequired,
    groupsStore: PropTypes.object.isRequired,
    devicesStore: PropTypes.object.isRequired
}

export default translate()(Campaign);