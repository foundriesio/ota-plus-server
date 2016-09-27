define(function(require) {
  var React = require('react'),
      Router = require('react-router'),
      Link = Router.Link,
      db = require('stores/db');
      
  class ImpactAnalysisHeader extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      var impactedDevices = this.props.impactedDevices;
      return (
        <div className="grey-header">      
          <div className="col-md-12">
            <Link to="/"><img src="/assets/img/icons/back.png" className="icon-back" alt=""/></Link>
            <div className="grey-header-icon"></div>
            <div className="grey-header-text">
              <div className="grey-header-title">Impact analyser</div>
              <div className="grey-header-subtitle">
                {!_.isUndefined(impactedDevices) ? 
                  Object.keys(impactedDevices).length ?
                    <span>Impact: {Object.keys(impactedDevices).length} Devices</span>
                  :
                    <span>No impacted devices</span>
                :
                  <span><i className="fa fa-circle-o-notch fa-spin"></i> impact analysis</span>
                }
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return ImpactAnalysisHeader;
});