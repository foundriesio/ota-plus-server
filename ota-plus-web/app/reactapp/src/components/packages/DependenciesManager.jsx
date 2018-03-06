import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import _ from 'underscore';
import { Modal } from '../../partials';

@observer
class DependenciesManager extends Component {
    @observable obj = {};

    constructor(props) {
        super(props);
        this.obj = {
            name: props.activePackage.filepath,
            required: [],
            incompatibles: [],
            requiredBy: []
        };
    }
    componentWillMount() {
        const { activePackage } = this.props;
        let pack = localStorage.getItem(activePackage.filepath);
        if(pack) {
            pack = JSON.parse(pack);
            this.obj = pack;
        }
    }
    getItemFromStorage(version) {
        return JSON.parse(localStorage.getItem(version));
    }
    addVersion(version) {
        const { activePackage, packagesStore } = this.props;

        let relatedItem = {
            name: version,
            required: [],
            incompatibles: [],
            requiredBy: []
        };

        if(_.indexOf(this.obj.required, version) > -1) {
            this.obj.incompatibles.push(version);
            this.obj.required.splice(_.indexOf(this.obj.required, version), 1);

            let itemFromStorage = this.getItemFromStorage(version);

            if(itemFromStorage) {
                itemFromStorage.incompatibles.push(activePackage.filepath);
                itemFromStorage.requiredBy.splice(_.indexOf(itemFromStorage.requiredBy, version), 1);
                localStorage.setItem(version, JSON.stringify(itemFromStorage));
            } else {
                relatedItem.incompatibles.push(activePackage.filepath);
                relatedItem.requiredBy.splice(_.indexOf(relatedItem.requiredBy, version), 1);
                localStorage.setItem(version, JSON.stringify(relatedItem));
            }

            localStorage.setItem(activePackage.filepath, JSON.stringify(this.obj));
        } else if(_.indexOf(this.obj.incompatibles, version) > -1) {
            this.obj.incompatibles.splice(_.indexOf(this.obj.incompatibles, version), 1);

            let itemFromStorage = this.getItemFromStorage(version);
            if(itemFromStorage) {
                itemFromStorage.incompatibles.splice(_.indexOf(itemFromStorage.incompatibles, activePackage.filepath), 1);
                localStorage.setItem(version, JSON.stringify(itemFromStorage));

                if(!itemFromStorage.incompatibles.length && !itemFromStorage.required.length && !itemFromStorage.requiredBy.length) {
                    localStorage.removeItem(version);
                }

            } else {
                relatedItem.incompatibles.splice(_.indexOf(relatedItem.incompatibles, version), 1);

                localStorage.setItem(activePackage.filepath, JSON.stringify(this.obj));
                localStorage.setItem(version, JSON.stringify(relatedItem));

                if(!relatedItem.incompatibles.length && !relatedItem.required.length && !relatedItem.requiredBy.length) {
                    localStorage.removeItem(version);
                }
            }

            if(!this.obj.incompatibles.length && !this.obj.required.length && !this.obj.requiredBy.length) {
                localStorage.removeItem(activePackage.filepath);
            } else {
                localStorage.setItem(activePackage.filepath, JSON.stringify(this.obj));
            }
        } else {
            this.obj.required.push(version);

            let itemFromStorage = this.getItemFromStorage(version);
            if(itemFromStorage) {
                itemFromStorage.requiredBy.push(activePackage.filepath);
                localStorage.setItem(version, JSON.stringify(itemFromStorage));
            } else {
                relatedItem.requiredBy.push(activePackage.filepath);
                localStorage.setItem(version, JSON.stringify(relatedItem));
            }

            localStorage.setItem(activePackage.filepath, JSON.stringify(this.obj));
        }
        
        packagesStore._handleCompatibles();
    }
    render() {
        const { shown, hide, packages, activePackage, packagesStore } = this.props;

        let requiredBy = [];
        _.each(packagesStore.compatibilityData, (data, index) => {
            let found = _.find(data.required, item => item === activePackage.filepath);
            if(found) {
                requiredBy.push(data.name);
            }
        });

        const content = (
            <span>
                <a href="#" id="close-manager" className="close-manager" title="Close sankey" onClick={hide.bind(this)}>
                    <img src="/assets/img/icons/white/cross.svg" alt="Icon" />
                </a>
                <div className="content">
                    <section className="head">
                        <div className="name">
                            Name
                        </div>
                        <div className="version">
                            Version
                        </div>
                    </section>
                    <section className="current-pack" id="current-pack">
                        <div className="name" id={"current-pack-" + activePackage.id.name}>
                            {activePackage.id.name}
                        </div>
                        <div className="version" id={"current-pack-" + activePackage.id.version}>
                            {activePackage.id.version}
                        </div>
                    </section>
                    <div className="other-packs-list" id="other-packs-list">
                        {_.map(packages, (packs, letter) => {
                            return _.map(packs, (pack, i) => {
                                return (
                                    pack.packageName !== activePackage.id.name ?
                                        <section className="other-pack" key={i}>
                                            <div className="name" id={"other-pack-" + pack.packageName}>
                                                {pack.packageName}
                                            </div>
                                            <div className="versions">
                                                {_.map(pack.versions, (version, index) => {
                                                    let versionString = version.filepath;
                                                    return (
                                                        version.id.version !== activePackage.id.version ?
                                                            <span className="item" key={index}>
                                                                <span className="value" id={"other-pack-" + version.id.version}>
                                                                    {version.id.version}
                                                                </span>
                                                                {this.obj.required.indexOf(versionString) > -1 ?
                                                                    <span className="label orange"
                                                                          id={"other-pack-mandatory-" + version.id.version}
                                                                          onClick={this.addVersion.bind(this, versionString)}>
                                                                          Mandatory
                                                                    </span>
                                                                : this.obj.incompatibles.indexOf(versionString) > -1 ?
                                                                    <span className="label red"
                                                                          id={"other-pack-incompatible-" + version.id.version}
                                                                          onClick={this.addVersion.bind(this, versionString)}>
                                                                          Not compatible
                                                                    </span>
                                                                : requiredBy.indexOf(versionString) > -1 ?
                                                                    <span className="label green"
                                                                          id={"other-pack-required-by-" + version.id.version}
                                                                          >
                                                                          Required by
                                                                    </span>
                                                                :
                                                                    <span className="label color-black"
                                                                          id={"other-pack-not-selected-" + version.id.version}
                                                                          onClick={this.addVersion.bind(this, versionString)}>
                                                                          Edit
                                                                    </span>
                                                                }                                                                
                                                            </span>
                                                        :
                                                            null
                                                    );
                                                })}
                                            </div>
                                        </section>
                                    :
                                        null
                                );
                            }); 
                        })}
                    </div>
                </div>
                <div className="footer">
                    <a href="#" onClick={hide.bind(this)} className="link-cancel" id="link-close">Close</a>
                </div>
            </span>
        );
        return (
            <Modal 
                title="Dependencies management"
                content={content}
                shown={shown}
                className="dependencies-manager-modal"
                hideOnClickOutside={true}
                onRequestClose={hide}
            />
        );
    }
}

export default DependenciesManager;