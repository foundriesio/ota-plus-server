import React, { Component, PropTypes } from 'react';
import { observable } from 'mobx';
import { observer, inject } from 'mobx-react';
import { Loader, AsyncResponse } from '../../../partials';
import { translate } from 'react-i18next';
import _ from 'underscore';

@inject('stores')
@observer
class WizardStep7 extends Component {
    componentWillMount() {
        const { updatesStore } = this.props.stores;
        const { wizardData } = this.props;
        const currentUpdate = _.first(wizardData[2].update);
        // toDo: to check if mtu data with current source id already is in store before fetch
        updatesStore.fetchUpdate(currentUpdate && currentUpdate.source.id);
    }

    render() {
        const { t, wizardData } = this.props;
        const { campaignsStore, groupsStore, updatesStore } = this.props.stores;

        const updateSummary = updatesStore.currentMtuData;

        return (
            <div className="step-inner">
                <AsyncResponse
                    handledStatus="error"
                    action={ campaignsStore.campaignsCreateAsync }
                    errorMsg={ (campaignsStore.campaignsCreateAsync.data ? campaignsStore.campaignsCreateAsync.data.description : null) }
                />
                <div className="box-summary">
                    <div className="title">{ "Software & Version" }</div>
                    <div className="desc">
                        {   updateSummary &&
                            _.map(updateSummary, (target, hardwareId) => {
                            const noInformation = "No information.";
                            const fromPackage = target.from.target;
                            const toPackage = target.to.target;
                            const fromVersion = target.from.checksum.hash;
                            const toVersion = target.to.checksum.hash;

                            return (
                                <div className="package-container" key={ hardwareId }>
                                    <label className="c-form__label">{ hardwareId }</label>
                                    <div className="update-container">
                                        <span className="director-updates">
                                            <div className="update-from">
                                                <div className="text">{ "From:" }</div>
                                                <div className="value"
                                                     id={ "from-package-name-" + fromPackage }>
                                                    { fromPackage ? fromPackage : noInformation }
                                                </div>
                                            </div>
                                            <div className="update-to">
                                                <div className="text">{ "To:" }</div>
                                                <div className="value" id={ "to-package-name-" + toPackage }>
                                                    { toPackage ? toPackage : noInformation }
                                                </div>
                                            </div>
                                        </span>
                                        <span className="director-versions">
                                            <div className="update-from">
                                                <div className="text">{ "Version:" }</div>
                                                <div className="value" id={ "from-package-version-" + fromVersion }>
                                                    { fromVersion ? fromVersion : noInformation }
                                                </div>
                                            </div>
                                            <div className="update-to">
                                                <div className="text">{ "Version:" }</div>
                                                <div className="value" id={ "to-package-version-" + toVersion }>
                                                    { toVersion ? toVersion : noInformation }
                                                </div>
                                            </div>
                                        </span>
                                    </div>
                                    <div className="hardware-id-container">
                                        <div className="text">{ "On:" }</div>
                                        <div className="value app-label"
                                             id={ "package-version-" + hardwareId }>
                                            { target.targetFormat }
                                        </div>
                                    </div>
                                </div>
                            );
                        }) }
                    </div>
                </div>
                <div className="box-summary groups">
                    <div className="title">{ "Groups & Devices" }</div>
                    <div className="desc">
                        <div className="wrapper-groups">
                            { _.map(wizardData[1].groups, (group, index) => {
                                return (
                                    <div className="element-box group" key={ index }>
                                        <div className="icon" />
                                        <div className="desc">
                                            <div className="title" id="wizard-summary-group-name">
                                                { group.groupName }
                                            </div>
                                            <div className="subtitle" id="wizard-summary-group-devices">
                                                { t('common.deviceWithCount', { count: groupsStore._getGroupDevices(group).length }) }
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) }
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

WizardStep7.propTypes = {
    wizardData: PropTypes.object.isRequired,
    stores: PropTypes.object,
};

export default translate()(WizardStep7);