/** @format */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import PublicKeyPopover from './PublicKeyPopover';
import _ from 'lodash';

@observer
class SecondaryEcu extends Component {
  onEcuClick = (ecu, e) => {
    if (e) e.preventDefault();
    const { selectEcu, changeHardwareOverlayVisibility } = this.props;
    selectEcu(ecu.hardwareId, ecu.id, ecu.image.filepath, 'secondary');
    changeHardwareOverlayVisibility.bind(this, false);
  };
  render() {
    const { active, ecu, device, changePopoverVisibility, popoverShown, copyPublicKey, publicKeyCopied, index } = this.props;
    return (
      <span>
        <a href='#' id={'hardware-secondary-' + ecu.id} className={'hardware-panel__ecu' + (active ? ' hardware-panel__ecu--selected' : '')} onClick={this.onEcuClick.bind(this, ecu)}>
          <div className='hardware-panel__ecu-desc'>
            <span id={'hardware-id-secondary-' + index} className='hardware-panel__hardware-label app-label'>
              {ecu.hardwareId}
            </span>{' '}
            <br />
            Serial: <span id={'hardware-serial-' + ecu.id}>{ecu.id}</span>
          </div>
          <div className='hardware-panel__ecu-actions' id={'hardware-key-icon-secondary-' + ecu.id}>
            <span className='hardware-panel__ecu-action hardware-panel__ecu-action--key'>
              <PublicKeyPopover
                serial={ecu.id}
                device={device}
                handleCopy={copyPublicKey}
                changePopoverVisibility={changePopoverVisibility}
                copied={publicKeyCopied}
                active={active}
                popoverShown={popoverShown}
              />
            </span>
          </div>
        </a>
      </span>
    );
  }
}

SecondaryEcu.propTypes = {
  active: PropTypes.bool,
  ecu: PropTypes.object.isRequired,
  handleCopy: PropTypes.func,
  handleRequestClose: PropTypes.func,
  handleTouchTap: PropTypes.func,
  popoverShown: PropTypes.bool,
  copied: PropTypes.bool,
  selectEcu: PropTypes.func,
};

export default SecondaryEcu;
