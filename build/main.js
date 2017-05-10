"use strict";

var MyInfoHead = React.createClass({
  displayName: "MyInfoHead",

  handleClick: function handleClick() {
    Preload.hide();
  },
  render: function render() {
    return React.createElement(
      "header",
      { className: "mui-bar mui-bar-nav" },
      React.createElement(
        "button",
        { onClick: this.handleClick, style: { color: '#555' }, className: "mui-action-back mui-btn  mui-btn-link mui-btn-nav mui-pull-left" },
        React.createElement("span", { className: "mui-icon mui-icon-left-nav" }),
        "头部"
      )
    );
  }
});
var Main = React.createClass({
  displayName: "Main",

  getInitialState: function getInitialState() {
    return {
      num: 20
    };
  },
  onRefresh: function onRefresh(fun) {
  	setTimeout(function(){
  			fun(3)
  	this.setState({
  		num:this.state.num+5
  	})
  	}.bind(this),2000)
  	
  },
  onLoadMore: function onLoadMore(fun) {
  	
  		setTimeout(function(){
  			this.setState({
  				num:this.state.num+5
  		})
  			fun(0)
  		}.bind(this),2000)
  		
  },
  render: function render() {
    var arr = [];
    for (var i = 0; i < this.state.num; i++) {
      arr.push(React.createElement(
        "li",
        null,
        "测试数据",
        i
      ));
    }
    return React.createElement(
      "div",
      null,
      React.createElement(MyInfoHead, null),
      React.createElement(
        PullToRefresh,
        { onRefresh: this.onRefresh, onLoadMore: this.onLoadMore },
        React.createElement(
          "ul",
          null,
          arr
        )
      ),
      React.createElement(
        "footer",
        { className: "mui-bar mui-bar-tab footer" },
        "页脚"
      )
    );
  }
});
ReactDOM.render(React.createElement(Main, null), document.getElementById('main'));