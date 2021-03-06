/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';

@observer
class ListItem extends Component {
  componentDidMount() {
    const { highlightedPackage, highlightPackage } = this.props;
    highlightPackage(highlightedPackage);
  }

  countInstalledOnEcus = () => {
    let installedOnEcus = 0;
    const { pack } = this.props;
    _.each(pack.versions, (version) => {
      installedOnEcus += version.installedOnEcus;
    });
    return installedOnEcus;
  };

  countPackVersionsNumber = () => {
    const { pack } = this.props;
    return pack.versions.length;
  };

  render() {
    const { pack, togglePackage, expandedPackageName, t } = this.props;
    const installedOnEcus = this.countInstalledOnEcus();
    const packVersionsNumber = this.countPackVersionsNumber();
    const directorBlock = (
      <div className="c-package__teaser">
        <div className="c-package__name" id={`target_package_${pack.packageName}`}>
          {pack.packageName}
        </div>
        <div className="c-package__versions-nr" id={`package-${pack.packageName}-versions-count`}>
          {t('software.versions_count', { count: packVersionsNumber })}
        </div>
        <div className="c-package__installed">
          <span id={`package-${pack.packageName}-installed-on-ecus`}>
            <span id={`package-${pack.packageName}-installed-on-ecus-count`}>
              {t('software.installed_on_count', { count: installedOnEcus })}
            </span>
          </span>
        </div>
        <div className="c-package__more-info">{t('common.more_info')}</div>
      </div>
    );
    return expandedPackageName === pack.packageName ? (
      <div
        className="c-package__item c-package__item--expanded item"
        id={`button-package-${pack.packageName}`}
        onClick={togglePackage.bind(this, pack.packageName)}
      >
        <div className="wrapper-center">
          <img src="assets/img/icons/black/arrow-up.svg" className="c-package__icon" alt="Icon" />
        </div>
      </div>
    ) : (
      <div
        className="c-package__item item"
        id={`button-package-${pack.packageName}`}
        onClick={togglePackage.bind(this, pack.packageName)}
      >
        {directorBlock}
      </div>
    );
  }
}

ListItem.propTypes = {
  pack: PropTypes.shape({}).isRequired,
  togglePackage: PropTypes.func.isRequired,
  highlightedPackage: PropTypes.string,
  highlightPackage: PropTypes.func,
  expandedPackageName: PropTypes.string,
  t: PropTypes.func.isRequired
};

export default withTranslation()(ListItem);
