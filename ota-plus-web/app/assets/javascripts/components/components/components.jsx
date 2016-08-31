define(function(require) {
  var React = require('react'),
      db = require('stores/db'),
      SotaDispatcher = require('sota-dispatcher'),
      ComponentsList = require('es6!./components-list'),
      ComponentsOverlay = require('es6!./components-overlay'),
      Loader = require('es6!../loader'),
      VelocityUI = require('velocity-ui'),
      VelocityHelpers = require('mixins/velocity/velocity-helpers'),
      VelocityComponent = require('mixins/velocity/velocity-component'),
      VelocityTransitionGroup = require('mixins/velocity/velocity-transition-group');

  class Components extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        detailsShown: false,
        detailsId: null,
        isComponentsListEmpty: null,
        componentsListHeight: '400px'
      };
      this.showDetails = this.showDetails.bind(this);
      this.closeDetails = this.closeDetails.bind(this);
      this.setComponentsListHeight = this.setComponentsListHeight.bind(this);
      this.checkPostStatus = this.checkPostStatus.bind(this);
      this.handleMenu = this.handleMenu.bind(this);
      db.components.addWatch("poll-components-list", _.bind(this.forceUpdate, this, null));
      db.postStatus.addWatch("poll-components-list-post-status", _.bind(this.checkPostStatus, this, null));
      SotaDispatcher.dispatch({actionType: 'get-components', device: this.props.deviceId});
    }
    componentDidMount() {
      window.addEventListener("resize", this.setComponentsListHeight);
      this.setComponentsListHeight();   
    }
    componentWillUnmount() {
      db.components.reset();
      db.components.removeWatch("poll-components-list");
      db.postStatus.removeWatch("poll-components-list-post-status");
      window.removeEventListener("resize", this.setComponentsListHeight);
    }
    setComponentsListHeight() {
      var windowHeight = jQuery(window).height();
      var offsetTop = jQuery('#components').offset().top;
      this.setState({
        componentsListHeight: windowHeight - offsetTop
      });
    }
    showDetails(id) {
      $('#components-list').addClass('components-list-shadow');
      if(this.state.detailsId !== id) {
        $('#components-menu a').removeClass('selected');
        $('#components-menu').find('[data-id="' + id + '"]').addClass('selected');
      }
      this.setState({
        detailsShown: true,
        detailsId: (this.state.detailsId !== id ? id : this.state.detailsId)
      });
    }
    closeDetails() {
      $('#components-list').removeClass('components-list-shadow');
      $('#components-menu a').removeClass('selected');
      this.setState({
        detailsShown: false,
        detailsId: null
      });
    }
    checkPostStatus() {
      var postStatus = db.postStatus.deref()['get-components'];
      if(!_.isUndefined(db.postStatus.deref()['get-components'])) {
        if(postStatus.code == '404')
          this.setState({isComponentsListEmpty: true});
      }
    }
    handleMenu() {
      var that = this;
      var MenuTree = {
        collapse: function(element) {
          element.slideToggle(500);
        },
        walk: function() {
          var padding_step = '10%';
          var max_nested_lvl = 0;
                    
          jQuery('a', '#components-menu').each(function() {
            var $a = $(this);
            max_nested_lvl = ($a.parents('li').length > max_nested_lvl) ? $a.parents('li').length : max_nested_lvl;
          });
            
          padding_step = Math.round(20 / max_nested_lvl);
                        
          $('a', '#components-menu').each(function() {
            var $a = $(this);
            var $li = $a.parent();

            if ($a.next().is('ul')) {
              var $ul = $a.next();
              $a.click(function(e) {
                e.preventDefault();
                if(e.target.className.indexOf('components-info-icon') > -1) {
                  that.showDetails($a.data('id'))
                } else {
                  MenuTree.collapse($ul);
                  $a.toggleClass('active').promise().done(function() {
                    $a.find('.components-menu-icon').html('<i class="fa fa-chevron-'+($a.hasClass('active') ? 'down' : 'right')+'" aria-hidden="true"></i> ');
                    if(!$a.hasClass('active') && $a.next('ul').find('[data-id="' + that.state.detailsId + '"]').length) {
                      that.closeDetails();
                    }
                  });
                }
              });
              $a.find('.components-menu-icon').html('<i class="fa fa-chevron-right" aria-hidden="true"></i> ');
            } else {
              $a.click(function(e) {
                e.preventDefault();
                if(e.target.className.indexOf('components-info-icon') > -1) {
                  that.showDetails($a.data('id'))
                }
              });
            }
            var padding = $a.parents('li').length * padding_step + '%';
            $a.css('padding-left', padding);
          });
        }
      };
      
      MenuTree.walk();  
    }
    render() {
      function animateLeftPosition(left, opacity, action) {
        return VelocityHelpers.registerEffect("transition."+action, {
          defaultDuration: 400,
          calls: [
            [{
              opacity: opacity,
              left: left,
            }]
          ],
        });
      }
      return (
        <div id="components" style={{height: this.state.componentsListHeight}}>
          <div id="components-list">
            {this.state.isComponentsListEmpty === null ?
              <VelocityTransitionGroup enter={{animation: "fadeIn"}} leave={{animation: "fadeOut"}}>
                {!_.isUndefined(db.components.deref()) ? 
                  <ul id="components-menu">
                    <ComponentsList
                      data={db.components.deref()}
                      mainLevel={true}
                      handleMenu={this.handleMenu}/>
                  </ul>
                : undefined}
                {_.isUndefined(db.components.deref()) ? 
                  <Loader />
                : undefined}
              </VelocityTransitionGroup>
            : 
              <div className="height-100 position-relative text-center">
                <div className="center-y padding-15">
                  This device hasn’t reported any information about
                  its hardware or system components yet.
                </div>
              </div>
            }
          </div>
          
          {!_.isUndefined(db.components.deref()) ? 
            <VelocityComponent animation={this.state.detailsShown ? 'fadeIn' : 'fadeOut'}>
              <ComponentsOverlay
                data={db.components.deref()}
                id={this.state.detailsId}
                closeDetails={this.closeDetails}/>
            </VelocityComponent>
          : undefined}
        </div>
      );
    }
  };

  return Components;
});
