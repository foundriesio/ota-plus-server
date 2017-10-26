import React, { Component, PropTypes } from 'react';
import { observer } from 'mobx-react';
import { observable } from 'mobx';
import _ from 'underscore';

@observer
class ListItem extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { item } = this.props;
		return (
            <div className="item">
                <div className="col">
                    {item.type === 'Error' ?
                        <img src="/assets/img/icons/red_cross.svg" alt="Icon" /> 
                    : item.type === 'Warning' ?
                        <img src="/assets/img/icons/warning.svg" alt="Icon" /> 
                    :
                        '-'
                    }
                </div>
                <div className="col">
                    {item.type}
                </div>
                <div className="col">
                    {item.time}
                </div>
                <div className="col">
                    {item.code}
                </div>
                <div className="col">
                    {item.log}
                </div>
            </div>
        );
    }
}

export default ListItem;