define(function(require) {
  var React = require('react'),
      SotaDispatcher = require('sota-dispatcher'),
      db = require('stores/db');

  class PackagesListItemDetailsVersion extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        activeEditField: false,
        showEditButton: false,
        commentFieldLength: 0,
        comment: this.props.version.description,
        commentTmp: this.props.version.description,
      };
      this.enableEditField = this.enableEditField.bind(this);
      this.disableEditField = this.disableEditField.bind(this);
      this.changeCommentFieldLength = this.changeCommentFieldLength.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);
      this.handleResponse = this.handleResponse.bind(this);
      db.postStatus.addWatch("poll-update-package-details", _.bind(this.handleResponse, this, null));
    }
    componentWillReceiveProps(nextProps) {
      if(nextProps.version.description !== this.props.version.description)
        this.setState({
          comment: nextProps.version.description,
          commentTmp: nextProps.version.description
        });
    }
    componentWillUnmount() {
      db.postStatus.removeWatch("poll-update-package-details");
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
      
      SotaDispatcher.dispatch({
        actionType: 'update-package-details',
        name: this.props.version.id.name,
        version: this.props.version.id.version,
        data: {"description": this.refs.comment.value}
      });
    }
    handleResponse() {
      var postStatus = !_.isUndefined(db.postStatus.deref()) ? db.postStatus.deref() : undefined;
      if(!_.isUndefined(postStatus['update-package-details']) && postStatus['update-package-details'].status === 'success') {
        var that = this;
        delete postStatus['update-package-details'];
        db.postStatus.reset(postStatus);
        setTimeout(function() {
          that.props.queryPackagesData();
        }, 1);
      }
    }
    formBlacklist(action, e) {
      this.props.showBlacklistForm(this.props.version.id.name, this.props.version.id.version, action);
    }
    render() {
      return (
        <li className={"package-version " + (this.props.version.isBlackListed ? "package-blacklist" : "")}>
          <div className="package-left-box pull-left">
            {!this.props.isOndevicesList ?
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
            : null}
          </div>
          <div className="package-right-box pull-right text-right">
            {!this.props.isOndevicesList ? 
              this.props.version.isBlackListed ?
                <div>
                  <div className="pull-right">
                    <button className="btn btn-blacklist btn-edit-blacklist" onClick={this.formBlacklist.bind(this, 'edit')} title="Edit blacklisted package version" id={"button-edit-blacklisted-package-" + this.props.version.id.name + "-" + this.props.version.id.version}></button>
                  </div>
                </div>
              : 
                <div className="pull-right">
                  <button className="btn btn-blacklist btn-add-blacklist" onClick={this.formBlacklist.bind(this, 'add')} title="Blacklist package version" id={"button-blacklist-package-" + this.props.version.id.name + "-" + this.props.version.id.version}></button>
                </div>
            : null}
            <div className="package-statuses pull-right">
              <div className="package-version-name pull-right">
                <span title={this.props.version.id.version}>{this.props.version.id.version}</span>
              </div>
            </div>
          </div>
        </li>
      );
    }
  };

  return PackagesListItemDetailsVersion;
});
