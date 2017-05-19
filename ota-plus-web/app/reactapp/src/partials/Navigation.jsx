import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { observer } from 'mobx-react';
import NavigationDropdown from './NavigationDropdown';

@observer
class Navigation extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { userStore, devicesStore } = this.props;
        const logoLink = '/';
        return (
            <nav className="navbar navbar-inverse navbar-fixed-top">
                  <div className="container">
                    <div className="navbar-header">
                          <Link to={logoLink} className="navbar-brand" id="logo"></Link>
                    </div>
                    <div id="navbar">
                          <ul className="nav navbar-nav">
                                <li>
                                    <Link to="/devices" activeClassName="active" id="link-devices">Devices</Link>
                                </li>
                                <li>
                                    <Link to="/packages" activeClassName="active" id="link-packages">Packages</Link>
                                </li>
                                <li>
                                    <Link to="/campaigns" activeClassName="active" id="link-campaigns">Campaigns</Link>
                                </li>
                                <li>
                                    <Link to="/impact-analysis" activeClassName="active" id="link-impactanalysis">Impact analysis</Link>
                                </li>
                          </ul>
                    </div>
                    <ul className="right-nav">
                        <li className="text-link">
                            <a href="http://docs.atsgarage.com" target="_blank" id="docs-link">DOCS</a>
                        </li>
                        <li className="separator">|</li>
                        <li className="text-link">
                            <a href="mailto:support@atsgarage.com" id="support-link">SUPPORT</a>
                        </li>
                        <li id="menu-login">
                            <NavigationDropdown 
                                userStore={userStore}
                            />
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

Navigation.propTypes = {
    userStore: PropTypes.object.isRequired
}

export default Navigation;