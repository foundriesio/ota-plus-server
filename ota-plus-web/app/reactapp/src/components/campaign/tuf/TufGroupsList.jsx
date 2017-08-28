import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import _ from 'underscore';
import TufGroupsListItem from './TufGroupsListItem';

@observer
class TufGroupsList extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { showCancelGroupModal, campaignsStore, groupsStore } = this.props;
        return (
            <div className="container">
                <table className="table table-fixed">
                    <tbody>
                        {_.map(campaignsStore.campaign.groups, (groupId, index) => {
                            const foundGroup = _.findWhere(groupsStore.groups, {id: groupId});
                            let groupStat = _.find(campaignsStore.campaign.statistics.stats, (stat, gId) => {
                                return gId === groupId;
                            });
                            return (
                                <TufGroupsListItem
                                    group={groupId}
                                    campaign={campaignsStore.campaign}
                                    statistics={groupStat}
                                    foundGroup={foundGroup}
                                    showCancelGroupModal={showCancelGroupModal}
                                    key={index}
                                />
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    }
}

TufGroupsList.propTypes = {
    showCancelGroupModal: PropTypes.func.isRequired,
    campaignsStore: PropTypes.object.isRequired,
    groupsStore: PropTypes.object.isRequired
}

export default TufGroupsList;