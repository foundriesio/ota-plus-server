define(function(require) {

  var React = require('react'),
      _ = require('underscore'),
      Router = require('react-router'),
      Fluxbone = require('../../mixins/fluxbone'),
      ShowPackagesForDevices = require('../packages/show-packages-for-devices'),
      SotaDispatcher = require('sota-dispatcher');

  var ListOfVehicles = React.createClass({
    componentWillUnmount: function(){
      this.props.Vehicles.removeWatch(this.props.PollEventName);
    },
    componentWillMount: function(){
      SotaDispatcher.dispatch(this.props.DispatchObject);
      this.props.Vehicles.addWatch(this.props.PollEventName, _.bind(this.forceUpdate, this, null));
    },
    componentWillUpdate: function(nextProps, nextState) {
      this.props.UpdateDimensions();
    },
    componentDidMount: function() {
      this.props.UpdateDimensions();
    },
    onClick: function(vin, t) {
      this.props.onClick(t, vin);
    },
    render: function() {
      var vehicles = _.map(this.props.Vehicles.deref(), function(vehicle, i) {
        var lastSeenDate = new Date(vehicle.lastSeen * 1000);
        return (
          <tr key={vehicle.vin} className={this.props.SelectedVin == vehicle.vin ? 'selected' : ''} onClick={this.props.AllowAssociatedPackagesAction ? this.onClick.bind(null, vehicle.vin) : ''}>
            <td className={'status-'+(vehicle.status != '' ? vehicle.status : 'neverseen')}>
              <Router.Link to='vehicle' params={{vin: vehicle.vin}} onClick={e => e.stopPropagation()}>
              { vehicle.vin }
              </Router.Link>
            </td>
            <td>
              <div>
                {(() => {
                  switch (vehicle.status) {
                    case "error":
                      return (
                        <div>
                          <div>
                            <strong>Last seen online: {lastSeenDate.toDateString() + ' ' + lastSeenDate.toLocaleTimeString()}</strong>
                          </div>
                          <div>
                            Status: <span className="label label-danger">error</span>
                          </div>
                        </div>
                      );
                    case "out-of-date":
                      return (
                        <div>
                          <div>
                            <strong>Last seen online: {lastSeenDate.toDateString() + ' ' + lastSeenDate.toLocaleTimeString()}</strong>
                          </div>
                          <div>
                            Status: <span className="label label-warning">out-of-date</span>
                          </div>
                        </div>
                      );
                    case "up-to-date":
                      return (
                        <div>
                          <div>
                            <strong>Last seen online: {lastSeenDate.toDateString() + ' ' + lastSeenDate.toLocaleTimeString()}</strong>
                          </div>
                          <div>
                            Status: <span className="label label-success">up-to-date</span>
                          </div>
                        </div>
                      );
                    default:
                      return (
                        <div>
                          <div>
                            <strong>Never seen online</strong>
                          </div>
                          <div>
                            Download SDK: 
                            <a href={`/api/v1/client/${vehicle.vin}/deb/32`} onClick={e => e.stopPropagation()}> debian 32 </a> or
                            <a href={`/api/v1/client/${vehicle.vin}/deb/64`} onClick={e => e.stopPropagation()}> debian 64 </a>
                          </div>
                        </div>
                      );
                  }
                })()}
              </div>
            </td>
          </tr>
        );
      }, this);
      return (
        <div className="resizeWrapper">
          <table id={this.props.AllowAssociatedPackagesAction ? 'table-vehicles' : ''} className="table table-bordered">
            <tbody>
              { vehicles }
            </tbody>
          </table>
        </div>
      );
    }
  });

  return ListOfVehicles;
});
