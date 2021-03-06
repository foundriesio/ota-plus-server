/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer } from 'mobx-react';

@observer
class ListItem extends Component {
  render() {
    const { update, showUpdateDetails } = this.props;
    return (
      <div className="c-update">
        <div className="c-update__item item">
          <div className="c-update__teaser" id={`update_item_${update.name}`}>
            <div className="c-update__name">
              <span>{update.name}</span>
            </div>
            <div className="c-update__hash">{update.description}</div>
            <div className="c-update__edit">
              <a
                href="#"
                className="add-button"
                id={`edit-update-${update.name}`}
                onClick={showUpdateDetails.bind(this, update)}
              >
                <span>{'More details'}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ListItem.propTypes = {
  update: PropTypes.shape({}).isRequired,
  showUpdateDetails: PropTypes.func.isRequired,
};

export default ListItem;
