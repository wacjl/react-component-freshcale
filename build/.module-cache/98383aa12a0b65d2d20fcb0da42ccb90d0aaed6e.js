'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var TimeUtil = {

	init: function init(type, time) {
		this.date = new Date(time);
		this.year = this.date.getFullYear();
		this.month = this.date.getMonth() + 1;
		this.day = this.date.getDate();
		this.hours = this.date.getHours();
		this.minutes = this.date.getMinutes();
		switch (type) {
			case 'year':
				return this.getYear();
			case 'month':
				return this.getNum(12, this.month);
			case 'day':
				return this.getDay(this.year, this.month);
			case 'hours':
				return this.getNum(24, this.hours);
			case 'minutes':
				return this.getNum(59, this.minutes);
		}
	},
	getYear: function getYear() {
		var year = this.year,
		    index = 0;
		for (var i = 2015, arr = [], j = 0; i <= year + 3; i++, j++) {
			i == year && (index = j);
			arr.push(i);
		}
		return { data: arr, index: index };
	},

	getNum: function getNum(num, currentNum) {
		for (var i = 1, arr = [], index = 0; i <= num; i++) {
			i == currentNum && (index = i - 1);
			i = i < 10 ? "0" + i : i;
			arr.push(i);
		}
		if (num == 59) {
			//时间从00开始
			arr.unshift('00');
			index += (currentNum == 0 ? 0 : 1);
		}
		return { data: arr, index: index };
	},
	getDay: function getDay(year, month) {
		var days = this.getDate(year, month);
		return this.getNum(days, this.day);
	},
	getDate: function getDate(year, month) {
		if (month == 1 || month == 3 || month == 5 || month == 7 || month == 8 || month == 10 || month == 12) {
			return 31;
		} else if (month == 4 || month == 6 || month == 9 || month == 11) {
			return 30;
		} else if (month == 2) {
			if (year % 4 == 0 && year % 100 != 0 || year % 400 == 0) {
				//判断闰年
				return 29;
			} else {
				return 28;
			}
		}
	}
};

var DatePickerItem = (function (_React$Component) {
	_inherits(DatePickerItem, _React$Component);

	function DatePickerItem(props) {
		_classCallCheck(this, DatePickerItem);

		_get(Object.getPrototypeOf(DatePickerItem.prototype), 'constructor', this).call(this);
		//console.log(TimeUtil.init(props.type))
		var json = TimeUtil.init(props.type, props.data);

		this.offset = 0;
		this.height = 40; //每个数据项高度
		this.state = _extends({}, json, {
			style: {
				transitionTimingFunction: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
				transitionDuration: '0ms',
				transform: 'translate3d(0px, 0px,0px)'
			}
		});
	}

	_createClass(DatePickerItem, [{
		key: 'componentDidMount',
		value: function componentDidMount() {
			this.initY(this.state.index);
		}
	}, {
		key: 'initY',
		value: function initY(index) {
			this.initOffset = this.getY(index);
			this.changeY(this.initOffset);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {

			var json = TimeUtil.init(nextProps.type, nextProps.data);

			var style = formatCss({
				transform: 'translate3d(0px, ' + this.getY(json.index) + 'px,0px)'
			});
			this.setState(_extends({}, json, {
				style: style
			}));
		}
	}, {
		key: 'getY',
		value: function getY(index) {
			return (2 - index) * this.height;
		}
	}, {
		key: 'changeY',
		value: function changeY(y, time) {
			this.offset = y;
			var json = {
				transform: 'translate3d(0px, ' + y + 'px,0px)',
				transitionDuration: time ? time + 'ms' : '0ms'
			};
			this.setState({
				style: formatCss(json)
			});
		}
	}, {
		key: 'touchStart',
		value: function touchStart(e) {
			var point = e.changedTouches ? e.changedTouches[0] : e;
			this.updateInertiaParams(point, e, true);
			this.y = point.pageY;
			this.maxBottom = -this.refs.ul.scrollHeight + 120;
			this.maxTop = 80;
		}
	}, {
		key: 'touchMove',
		value: function touchMove(e) {
			this.move = true;
			var point = e.changedTouches ? e.changedTouches[0] : e;
			this.updateInertiaParams(point, e);
			var offset = point.pageY - this.y;
			this.y = point.pageY;
			var y = this.offset + offset;
			y = y >= this.maxTop ? this.maxTop : y <= this.maxBottom ? this.maxBottom : y; //极限值判断
			this.changeY(y);
		}
	}, {
		key: 'touchEnd',
		value: function touchEnd(e) {
			var point = e.changedTouches ? e.changedTouches[0] : e;
			this.slowAction(e, point);
		}
	}, {
		key: 'endScroll',
		value: function endScroll() {
			var index = Math.round(2 - this.offset / this.height); //算出在数值中的位置
			this.props.onSelect(this.state.data[index], this.props.type);
			this.changeY(this.getY(index), 200);
		}
	}, {
		key: 'slowAction',
		value: function slowAction(e, point) {
			//缓动代码
			//计算速度
			var nowTime = e.timeStamp || Date.now();
			var v = (point.pageY - this.lastMoveStart) / (nowTime - this.lastMoveTime); //最后一段时间手指划动速度 
			console.log(v);
			if (Math.abs(v) < 0.35) {
				this.endScroll();return;
			}
			var dir = v > 0 ? -1 : 1; //加速度方向
			var deceleration = dir * 0.0006 * -1;
			var duration = Math.abs(v / deceleration) * 0.8; // 速度消减至0所需时间 
			var dist = v * duration / 2; //最终移动多少
			var startDistance = this.offset,
			    distDistance = dist,
			    srcDistance = distDistance;
			if (startDistance + distDistance <= this.maxBottom) {
				distDistance = this.maxBottom - startDistance;
				duration = duration * (distDistance / srcDistance) * 0.6;
			}
			if (startDistance + distDistance >= this.maxTop) {
				distDistance = this.maxTop - startDistance;
				duration = duration * (distDistance / srcDistance) * 0.6;
			}
			//----

			if (distDistance == 0) {
				this.endScroll();
				return;
			}
			this.scrollDistAngle(nowTime, startDistance, distDistance, duration);
		}
	}, {
		key: 'quartEaseOut',
		value: function quartEaseOut(t, b, c, d) {
			return -c * (t /= d) * (t - 2) + b;
		}
	}, {
		key: 'scrollDistAngle',
		value: function scrollDistAngle(nowTime, startDistance, distDistance, duration) {
			var self = this;
			self.move = false;
			(function (nowTime, startDistance, distDistance, duration) {
				var frameInterval = 13;
				var stepCount = duration / frameInterval;
				var stepIndex = 0;
				(function inertiaMove() {
					if (self.move) {
						return;
					}
					var newDistance = self.quartEaseOut(stepIndex, startDistance, distDistance, stepCount);
					self.changeY(newDistance);
					stepIndex++;
					if (stepIndex > stepCount - 1 || newDistance <= self.maxBottom || newDistance >= self.maxTop) {
						self.endScroll();
						return;
					}
					setTimeout(inertiaMove, frameInterval);
				})();
			})(nowTime, startDistance, distDistance, duration);
		}
	}, {
		key: 'updateInertiaParams',
		value: function updateInertiaParams(point, event, isStart) {
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
		}
	}, {
		key: 'getText',
		value: function getText(type) {
			switch (type) {
				case 'year':
					return '年';
				case 'month':
					return '月';
				case 'day':
					return '日';
				case 'hours':
					return '时';
				case 'minutes':
					return '分';
			}
		}
	}, {
		key: 'render',
		value: function render() {
			var arr = [];

			this.state.data.forEach(function (item, index) {
				arr.push(React.createElement("li", null, item));
			});

			return React.createElement("div", { className: "picker-viewport datepicker-col-1" }, React.createElement("div", { className: "picker-wheel" }, this.getText(this.props.type)), React.createElement("ul", { className: "picker-scroll", style: this.state.style, ref: "ul",
				onTouchStart: this.touchStart.bind(this),
				onTouchMove: this.touchMove.bind(this), onTouchEnd: this.touchEnd.bind(this) }, arr));
		}
	}]);

	return DatePickerItem;
})(React.Component);

var DatePicker = React.createClass({ displayName: "DatePicker",
	getInitialState: function getInitialState() {
		return {
			date: new Date(),
			isShow: false
		};
	},
	componentDidMount: function componentDidMount() {
		var date = this.state.date;
		this.initData(date);
		if (this.props.isShow) {
			this.controlShow();
		}
	},
	initData: function initData(date) {
		this.year = date.getFullYear(); //得到年月日
		this.month = date.getMonth() + 1;
		this.day = date.getDate();
		this.hours = this.liteTo10(date.getHours());
		this.minutes = this.liteTo10(date.getMinutes());
	},
	liteTo10: function liteTo10(num) {
		return num < 10 ? '0' + num : num;
	},
	componentWillReceiveProps: function componentWillReceiveProps(nextprops) {
		var date = nextprops.nextDate &&nextprops=='date' ? new Date(nextprops.nextDate) : new Date();
		console.log(nextprops)
		console.log(date.getHours())
		this.initData(date);
		this.setState({
			isShow: nextprops.isShow,
			date: date
		});
	},
	onSelect: function onSelect(data, type) {
		var lastyear = this.year,
		    lastmonth = this.month;
		this.props.type == 'date' && data[0] == '0' && (data = data[1]);
		this[type] = data;
		var days = TimeUtil.getDate(this.year, this.month);

		this.day = this.day > days ? days : this.day;
		//console.log('day '+this.day)
		if (type != 'day' && TimeUtil.getDate(lastyear, lastmonth) != days) {
			this.setState({
				date: this.year + '-' + this.month + '-' + this.day
			});
		}
		//console.log(data,type)
	},
	onComfireClick: function onComfireClick() {
		//确定
		//console.log(this.year,this.month,this.day);
		this.controlShow();
		var data = { type: this.props.type };

		if (this.props.type == 'time') {
			data.data = this.hours + ':' + this.minutes;
		} else if (this.props.type == 'date') {
			data.data = this.year + '-' + this.month + '-' + this.day;
		}
		this.props.onSelect(data);
	},
	controlShow: function controlShow() {
		this.setState({
			isShow: !this.state.isShow
		});
	},
	render: function render() {
		var value = this.state.date;
		//console.log(this.state)
		var style = {
			display: this.state.isShow ? 'block' : 'none'
		};
		var arr = [];
		if (this.props.type == 'date') {
			arr.push(React.createElement("div", { className: "picker-content" }, React.createElement(DatePickerItem, { data: value, type: "year", onSelect: this.onSelect }), React.createElement(DatePickerItem, { data: value, type: "month", onSelect: this.onSelect }), React.createElement(DatePickerItem, { data: value, type: "day", onSelect: this.onSelect })));
		} else if (this.props.type == 'time') {
			arr.push(React.createElement("div", { className: "picker-content" }, React.createElement(DatePickerItem, { data: value, type: "hours", onSelect: this.onSelect }), React.createElement(DatePickerItem, { data: value, type: "minutes", onSelect: this.onSelect })));
		}

		return React.createElement("div", { className: "picker", style: style }, React.createElement("div", { className: "picker-mask", onClick: this.controlShow }), React.createElement("div", { className: "picker-body" }, React.createElement("div", { className: "picker-navbar" }, React.createElement("a", { className: "picker-navbar-btn mui-pull-right", onClick: this.onComfireClick }, "完成"), React.createElement("a", { className: "picker-navbar-btn mui-pull-left", onClick: this.controlShow }, "取消")), arr));
	}
});