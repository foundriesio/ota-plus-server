import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';

@observer
class Fleet extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <span>Container</span>
        );
    }
}

export default Fleet;