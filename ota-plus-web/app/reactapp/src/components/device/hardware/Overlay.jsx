import React, { Component, PropTypes } from 'react';
import { observer, observable } from 'mobx-react';
import _ from 'underscore';
import DeviceHardwareOverlayItem from './OverlayItem';
import { Modal } from '../../../partials';

@observer
class Overlay extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { hardware, hideDetails, shown } = this.props;
        const content = (
            <div id="hardware-overlay">
                <div className="triangle"></div>
                <div className="details">
                    <DeviceHardwareOverlayItem 
                        data={hardware}
                        mainLevel={true}
                    />
                </div>
            </div>
        );

        return (
            <Modal 
                title={<img src="/assets/img/icons/chip.png" alt="" style={{width: '90px'}}/>}
                content={content}
                shown={shown}
                className="hardware-overlay-modal"
                hideOnClickOutside={true}
                onRequestClose={hideDetails}
            />
        );
    }
}

Overlay.propTypes = {
    hardware: PropTypes.object.isRequired,
    hideDetails: PropTypes.func.isRequired
}

export default Overlay;