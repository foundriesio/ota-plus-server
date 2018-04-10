import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import PublicKeyPopover from './PublicKeyPopover';
import _ from 'underscore';

@observer
class SecondaryEcu extends Component {
    constructor(props) {
        super(props);
        this.onEcuClick = this.onEcuClick.bind(this);
    }
    onEcuClick(ecu, e) {
        if(e) e.preventDefault();
        const { selectEcu, hideHardwareOverlay } = this.props;
        selectEcu(ecu.hardwareId, ecu.id, ecu.image.filepath, 'secondary');
        hideHardwareOverlay();
    }
    render() {
        const { active, ecu, ...otherProps} = this.props;
        return (
            <span>
                <a
                    href="#"
                    id={"hardware-secondary-" + ecu.id}
                    className={active ? " selected" : ""}
                    onClick={this.onEcuClick.bind(this, ecu)}
                >
                    <div className="desc">
                        <span id={"hardware-id-" + ecu.hardwareId} className="app-label">
                            {ecu.hardwareId}
                        </span> <br />
                        Serial: <span id={"hardware-serial-" + ecu.id}>
                            {ecu.id}
                        </span>
                    </div>
                    <div className="icons"
                         id={"hardware-key-icon-secondary-" + ecu.id}
                         onClick={otherProps.handleTouchTap}>
                            <span className="hardware-icon key">
                                {active ?
                                    <img src="/assets/img/icons/white/key.svg" alt="Icon" />
                                :
                                    <img src="/assets/img/icons/black/key.svg" alt="Icon" />
                                }
                            </span>
                    </div>
                </a>
                <PublicKeyPopover
                    {...otherProps}
                    ecu={ecu}
                />
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
