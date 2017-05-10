
/**
 * 驼峰写法
 * @param  {String} str 要转化的字符串
 * @return {String}     转化后的字符串
 */


var PullToRefresh = React.createClass({
	displayName: 'PullToRefresh',

	getInitialState: function getInitialState() {
		return {
			pullDownState: 0,
			pullUpState: 0,
			showTip: false,
			style: {
				transitionTimingFunction: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
				transitionDuration: '0ms',
				transform: 'translate3d(0px, 0px,0px) translateZ(0px)'
			}
		};
	},
	componentDidMount: function componentDidMount() {
		this.tips = ['下拉可以刷新', '释放立即刷新', '正在刷新', '刷新成功'];
		this.bottomTips = ['上拉加载更多', '正在加载...', '没有更多数据了', '加载失败'];
		this.container = this.refs.container;
		this.style = this.getInitialState().style;
		this.max = 75;
		this.canPullDown = true;
		this.windowHeight = window.document.body.scrollHeight;
		this.offset = 0;
		///this.bottomMax = -(this.height - this.windowHeight + 140);
	},
	touchStart: function touchStart(e) {
		this.move = true;
		if(e.changedTouches.length>1){return;}
		var event = e.changedTouches[0] ? e.changedTouches[0] : e;
		this.lastY = this.y = event.pageY;
		this.height = this.container.scrollHeight;
	//	alert(this.height)  
		
		this.bottomMax = -(this.height - this.windowHeight+100);
		this.downBottom = false; //滚动最底部
		this.startTime = new Date(); //开始时间
		this.updateInertiaParams(event, e, true); //
		this.topMax = 0;
	},
	touchMove: function touchMove(e) {
		this.move = true;
		if(e.changedTouches.length>1){return;}
		var event = e.changedTouches[0] ? e.changedTouches[0] : e;
		var offset = event.pageY - this.y;
		var up = event.pageY - this.lastY; //判断在滑动过程中是否来回滑动
		this.lastY = event.pageY;
		if (offset > 0 && this.offset <= this.max && this.canPullDown && this.offset > -1) {
			//下滑动
			if (!this.state.showTip) {
				this.setState({
					showTip: true
				});
			}
			if (this.offset >= 50 && this.state.pullDownState == 0) {
				this.setState({
					pullDownState: 1
				});
			} else if (this.offset < 50 && this.state.pullDownState == 1) {
				this.setState({
					pullDownState: 0
				});
			}
			//this.cancel=up>=0?false:true;//下拉过程中判断是否又上拉了来取消刷新
			this.down = false; //下拉松开回到顶部
			this.offset += up * 0.35; //下拉快慢
			this.offset = this.offset > this.max ? this.max : this.offset;
			
			this.startScroll('', this.offset);
		} else if (this.offset == 50 && this.state.pullDownState == 2 && up < 0) {
			this.down = true;
			this.setState({
				showTip: false,
				pullDownState: 0
			});
			this.startScroll('200ms', 0);
		} else if (this.offset <= 0) {
			this.down = true;
			this.offset += up * 1.2; //下拉快慢
			this.offset = this.offset <= this.bottomMax ? this.bottomMax : this.offset;
			if (this.offset == this.bottomMax) {
				//滚动到底
				this.endScroll();
			}
			this.startScroll('', this.offset);
		}
	},
	touchEnd: function touchEnd(e) {
		if(e.changedTouches.length>1){return;}
		this.canPullDown = false;
		var state = 0,
		    visibility = false;
		setTimeout((function () {
			this.canPullDown = true;
		}).bind(this), 200);
		var event = e.changedTouches[0] ? e.changedTouches[0] : e;
		if (this.down) {
			this.slowAction(e, event); //开始缓动
		} else {
				if (this.state.pullDownState == 1 && this.offset > 50) {
					this.startScroll('100ms', 50);
					state = 2;visibility = true;
					this.props.onRefresh(this.endRefresh); //刷新
				} else {
						this.startScroll('200ms', 0);
						
					}
				this.controlState(state, visibility);
			}
	},
	endScroll: function endScroll() {
		if (this.state.pullUpState == 1) {
			//正在加载
			return;
		}
		this.offset = this.bottomMax;

		this.setState({
			pullUpState: 1
		});
		this.props.onLoadMore(this.updateEndScroll.bind(this)); //加载更多数据
	},
	updateEndScroll: function updateEndScroll(data) {
		//
		this.setState({
			pullUpState: data
		});
	},
	slowAction: function slowAction(e, point) {
		//缓动代码
		//计算速度
		var nowTime = e.timeStamp || Date.now();
		var v = (point.pageY - this.lastMoveStart) / (nowTime - this.lastMoveTime); //最后一段时间手指划动速度 
		if (Math.abs(v) < 0.5) {
			return;
		}
		var dir = v > 0 ? -1 : 1; //加速度方向
		var deceleration = dir * 0.0006 * -1;
		var duration = Math.abs(v / deceleration) * 0.75; // 速度消减至0所需时间 
		var dist = v * duration / 2; //最终移动多少
		var startDistance = this.offset,
		    distDistance = dist,
		    srcDistance = distDistance;
		if (startDistance + distDistance <= this.bottomMax) {
			distDistance = this.bottomMax - startDistance;
			duration = duration * (distDistance / srcDistance) * 0.5;
		}
		if (startDistance + distDistance >= this.topMax) {
			distDistance = this.topMax - startDistance;
			duration = duration * (distDistance / srcDistance) * 0.5;
		}
		//----

		if (distDistance == 0) {
			//	this.endScroll();
			return;
		}
		this.scrollDistAngle(nowTime, startDistance, distDistance, duration);
	},
	quartEaseOut: function quartEaseOut(t, b, c, d) {
		return -c * (t /= d) * (t - 2) + b;
	},
	scrollDistAngle: function scrollDistAngle(nowTime, startDistance, distDistance, duration) {
		var self = this;
		self.move = false;

		(function (nowTime, startDistance, distDistance, duration) {
			var frameInterval = 13;
			var stepCount = duration / frameInterval;
			var stepIndex = 0;
			(function inertiaMove() {
				if (self.move) {
					return;
				}; //在运动中取消
				var newDistance = self.quartEaseOut(stepIndex, startDistance, distDistance, stepCount);
				self.startScroll('', newDistance);
				stepIndex++;
				if (stepIndex > stepCount - 1 || newDistance <= self.bottomMax || newDistance >= self.topMax) {

					if (newDistance <= self.bottomMax + 2) {
						self.endScroll();
					}
					return;
				}
				setTimeout(inertiaMove, frameInterval);
			})();
		})(nowTime, startDistance, distDistance, duration);
	},
	updateInertiaParams: function updateInertiaParams(point, event, isStart) {
		//记录最后一段时间的位置
		var self = this;
		if (isStart) {
			self.lastMoveStart = point.pageY;
			self.lastMoveTime = event.timeStamp || Date.now();
		} else {
			var nowTime = event.timeStamp || Date.now();
			if (nowTime - self.lastMoveTime > 300) {
				self.lastMoveTime = nowTime;
				self.lastMoveStart = point.pageY;
			}
		}
	},
	controlState: function controlState(state, visibility) {
		this.setState({
			pullDownState: state,
			showTip: visibility
		});
	},
	endRefresh: function endRefresh(data) {
		var time = 0;
		if (data) {
			//存在
			time = 1000;
			this.setState({
				pullDownState: data
			});
		}
		setTimeout((function () {
			this.refresh();
		}).bind(this), time);
	},
	refresh: function refresh() {
		this.startScroll('0ms', 0);
		setTimeout((function () {
			this.setState({
				pullDownState: 0,
				showTip: false
			});
		}).bind(this), 50);
	},
	startScroll: function startScroll(time, offset) {
		this.offset = offset;
		var json = {};
			
		time && (json.transitionDuration = time);
		offset && (json.transform = 'translate3d(0px, ' + offset + 'px,0px) translateZ(0px)');
		//alert(1)
	//	alert(formatCss)
	   var json = formatCss(json);
		
		this.setState({
			style: Object.assign({}, this.style, json)
		});
	},
	render: function render() {
		this.tips = this.tips || [];
		this.bottomTips = this.bottomTips || [];
		var showTip = {
			visibility: this.state.showTip ? 'visible' : 'hidden'
		};
		var iconStyle = null,
		    cs = 'mui-pull-loading mui-icon mui-icon-pulldown';
		if (this.state.pullDownState == 1) {
			iconStyle = formatCss({
				transition: 'transform 0.3s ease-in',
				transform: 'rotate(180deg)'
			});
		} else if (this.state.pullDownState == 2) {
			iconStyle = formatCss({
				transition: 'transform 0.3s ease-in',
				transform: 'rotate(180deg)',
				animation: 'spinner-spin 1s step-end infinite'
			});
			cs = 'mui-pull-loading mui-icon mui-spinner';
		} else if (this.state.pullDownState == 3) {
			iconStyle = {
				display: 'none'
			};
		}
		var iconcss = 'mui-pull-loading mui-icon mui-spinner ';
		iconcss += this.state.pullUpState == 1 ? 'mui-visibility' : 'mui-hidden';
		var bcstyle = { //整个容器显示
			visibility: 'visible'
		};
		return React.createElement(
			'div',
			{ className: 'wrapper' },
			React.createElement(
				'div',
				{ className: 'mui-pull-top-pocket mui-block', style: showTip },
				React.createElement(
					'div',
					{ className: 'mui-pull' },
					React.createElement('div', { className: cs, style: iconStyle }),
					React.createElement(
						'div',
						{ className: 'mui-pull-caption' },
						this.tips[this.state.pullDownState]
					)
				)
			),
			React.createElement(
				'div',
				{ className: 'scroller', ref: 'container', style: this.state.style,
					onTouchStart: this.touchStart,
				onTouchMove: this.touchMove, onTouchEnd: this.touchEnd
				},
				this.props.children,
				React.createElement(
					'div',
					{ className: 'mui-pull-bottom-pocket mui-block', style: bcstyle },
					React.createElement(
						'div',
						{ className: 'mui-pull' },
						React.createElement('div', { className: iconcss }),
						React.createElement(
							'div',
							{ className: 'mui-pull-caption mui-pull-caption-down' },
							this.bottomTips[this.state.pullUpState]
						)
					)
				)
			)
		);
	}
});