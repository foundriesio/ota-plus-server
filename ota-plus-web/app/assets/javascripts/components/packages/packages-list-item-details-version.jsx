define(function(require) {
  var React = require('react');

  class PackagesListItemDetailsVersion extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        activeEditField: false,
        showEditButton: false,
        commentFieldLength: 0,
        comment: '',
        commentTmp: '',
      };
      this.enableEditField = this.enableEditField.bind(this);
      this.disableEditField = this.disableEditField.bind(this);
      this.changeCommentFieldLength = this.changeCommentFieldLength.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
    }
    enableEditField(e) {
      e.preventDefault();
      this.setState({
        activeEditField: true
      });
      this.changeCommentFieldLength();
    }
    disableEditField(e) {
      e.preventDefault();
      var that = this;
      setTimeout(function(){
        if(document.activeElement.className.indexOf('accept-button') == -1) {
          that.setState({
            activeEditField: false,
            commentTmp: that.state.comment,
          });
        }
      }, 1);
    }
    changeCommentFieldLength() {
      var val = this.refs.comment.value;
      this.setState({
        commentFieldLength: val.length,
        commentTmp: val
      });
    }
    handleSubmit(e) {
      e.preventDefault();
      this.setState({
        comment: this.refs.comment.value,
        commentTmp: this.refs.comment.value,
        activeEditField: false
      });
    }
    render() {
      return (
        <li className="package-version">
              <div className="package-left-box pull-left">
                <form>
                  <fieldset>
                    <input className="input-comment" name="comment" value={this.state.commentTmp} type="text" placeholder="Comment here." ref="comment" onKeyUp={this.changeCommentFieldLength} onChange={this.changeCommentFieldLength} onFocus={this.enableEditField} />
                    
                    {this.state.commentFieldLength > 0 && this.state.activeEditField ?
                      <div className="pull-right">
                        <a href="#" className="cancel-button pull-right" onClick={this.disableEditField}>
                          <img src="/assets/img/icons/close_icon.png" alt="" />
                        </a>
                        &nbsp;
                        <a href="#" className="accept-button pull-right" onClick={this.handleSubmit}>
                          <img src="/assets/img/icons/accept_icon.png" alt="" />
                        </a>
                      </div>
                    : null}
                    
                  </fieldset>
                </form>
              </div>
              <div className="package-right-box pull-right text-right">
                {(this.props.version.attributes.status == 'installed' || this.props.version.attributes.status == 'queued') ?
                  <div className="package-statuses pull-right">
                    <span className="fa-stack package-status-circle">
                      <i className="fa fa-check-circle fa-stack-1x green" aria-hidden="true"></i>
                      <i className="fa fa-circle fa-stack-1x"></i>
                      {(this.props.version.attributes.status == 'installed') ? 
                        <i className="fa fa-check-circle fa-stack-1x green" aria-hidden="true"></i>
                      :
                        <i className="fa fa-dot-circle-o fa-stack-1x orange" aria-hidden="true"></i>
                      }
                    </span>
                    v. {this.props.version.id.version}
                    <div className="package-version-right pull-right">
                      <span className={"package-status-label " + (this.props.version.attributes.status == 'installed' ? 'green' : 'orange')}>
                        {this.props.version.attributes.status}
                      </span>
                    </div>
                  </div>
                :
                  <div className="package-statuses pull-right">
                    v. {this.props.version.id.version}
                    <div className="package-version-right pull-right">
                      {!this.props.isQueued ? 
                        <button className="btn btn-action btn-install pull-right" onClick={this.props.installPackage.bind(this, this.props.version.id.name, this.props.version.id.version)}>Install</button>
                      :
                        <button className="btn btn-action btn-install pull-right" disabled={true}>Install</button>
                      }
                    </div>
                  </div>
                }
              </div>
          </li>
      );
    }
  };

  return PackagesListItemDetailsVersion;
});