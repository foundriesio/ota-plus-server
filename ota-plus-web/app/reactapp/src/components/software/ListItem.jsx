/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';

@observer
class ListItem extends Component {
  countInstalledOnEcus = () => {
    let installedOnEcus = 0;
    _.each(this.props.pack.versions, (version, index) => {
      installedOnEcus += version.installedOnEcus;
    });
    return installedOnEcus;
  };

  countPackVersionsNumber = () => {
    return this.props.pack.versions.length;
  };

  componentDidMount() {
    const { highlightedPackage, highlightPackage } = this.props;
    highlightPackage(highlightedPackage);
  }

  render() {
    const { pack, togglePackage, expandedPackageName } = this.props;
    let installedOnEcus = this.countInstalledOnEcus();
    let packVersionsNumber = this.countPackVersionsNumber();
    const directorBlock = (
      <div className='c-package__teaser'>
        <div className='c-package__name' id={`target_package_${pack.packageName}`}>
          {pack.packageName}
        </div>
        <div className='c-package__versions-nr' id={'package-' + pack.packageName + '-versions-count'}>
          {packVersionsNumber === 1 ? packVersionsNumber + ' version' : packVersionsNumber + ' versions'}
        </div>
        <div className='c-package__installed'>
          <span id={'package-' + pack.packageName + '-installed-on-ecus'}>
            Installed on <span id={'package-' + pack.packageName + '-installed-on-ecus-count'}>{installedOnEcus}</span> Ecu(s)
          </span>
        </div>
        <div className='c-package__more-info'>More info</div>
      </div>
    );
    return expandedPackageName === pack.packageName ? (
      <div className='c-package__item c-package__item--expanded item' id={'button-package-' + pack.packageName} onClick={togglePackage.bind(this, pack.packageName)}>
        <div className='wrapper-center'>
          <img src='assets/img/icons/black/arrow-up.svg' className='c-package__icon' alt='Icon' />
        </div>
      </div>
    ) : (
      <div className='c-package__item item' id={'button-package-' + pack.packageName} onClick={togglePackage.bind(this, pack.packageName)}>
        {directorBlock}
      </div>
    );
  }
}

ListItem.propTypes = {
  pack: PropTypes.object.isRequired,
  togglePackage: PropTypes.func.isRequired,
};

export default ListItem;