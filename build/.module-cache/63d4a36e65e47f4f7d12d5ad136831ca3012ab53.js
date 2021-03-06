var TimeUtil={
	
	init(type,time){
		this.date=new Date(time);
		this.year=this.date.getFullYear();
		this.month=this.date.getMonth()+1;
		this.day=this.date.getDate();
		this.hours=this.date.getHours();
		this.minutes=this.date.getMinutes()<1?1:this.date.getMinutes();
		switch(type){
			case 'year':return this.getYear();
			case 'month':return this.getNum(12,this.month);
			case 'day':return this.getDay(this.year,this.month);
			case 'hours':return this.getNum(24,this.hours);
			case 'minutes':return this.getNum(59,this.minutes);
		}
	},
	getYear(){
			var year=this.year,index=0;
			for(var i=2015,arr=[],j=0;i<=year+3;i++,j++){
				i==year && (index=j);
				arr.push(i)
			}
			return{ data:arr,index:index}
	},
	
	getNum	(num,currentNum){
		for(var i=1,arr=[],index=0;i<=num;i++){
			i==currentNum && (index=i-1);
			i=i<10?"0"+i:i;
			arr.push(i)
		}
		if(num==59){//时间从00开始
			arr.unshift('00');
			index+=(currentNum==0?0:1);
		}
		return {data:arr,index:index}
	},
	getDay(year,month){
		var days=this.getDate(year,month);
		return this.getNum(days,this.day)
	},
	getDate(year,month){
		 if((month==1)||(month==3)||(month==5)||(month==7)||(month==8)||(month==10)||(month==12)){
                return 31;
            }else if((month==4)||(month==6)||(month==9)||(month==11)){
                return 30;
            }else if(month==2){
                if((year%4==0&&year%100!=0)||year%400==0){//判断闰年
                    return 29;
                }else{
                    return 28;
                }
            }
	}
}

class DatePickerItem extends React.Component{
	 constructor(props) {
	 	super();
	 	//console.log(TimeUtil.init(props.type))
	 	var json=TimeUtil.init(props.type,props.data);
	 	
	 	this.offset=0;
	 	this.height=40;//每个数据项高度
	 	this.state={
	 		...json,
	 		style:{
	 			transitionTimingFunction: 'cubic-bezier(0.1, 0.57, 0.1, 1)',
				transitionDuration:'0ms',
				transform: 'translate3d(0px, 0px,0px)'
			}
	 	};
	 }
	 componentDidMount(){
	 	this.initY(this.state.index)
	 }
	 initY(index){
	 	this.initOffset=this.getY(index)
	 	this.changeY(this.initOffset)
	 }
	 componentWillReceiveProps(nextProps){

	 	var json=TimeUtil.init(nextProps.type,nextProps.data);
	 	
	 	var style=formatCss({
	 		transform: 'translate3d(0px, '+this.getY(json.index)+'px,0px)'
	 	})
	 	this.setState({
	 		...json,
	 		style:style
	 	})
	 }
	 
	 getY(index){
	 	return (2-index)*this.height;
	 }
	 changeY(y,time){
	 	this.offset=y;
	 	var json={
	 		transform: 'translate3d(0px, '+y+'px,0px)',
	 		transitionDuration:time?time+'ms':'0ms'
	 	}
	 	this.setState({
	 		style:formatCss(json)
	 	})
	 }
	 touchStart(e){
	 	var point = e.changedTouches ? e.changedTouches[0] : e;
	 	this.updateInertiaParams(point,e,true);
	 	this.y=point.pageY;
	 	this.maxBottom=-(this.refs.ul.scrollHeight)+120;
	 	this.maxTop=80;
	 }
	 touchMove(e){
	 	this.move=true;
	 	var point = e.changedTouches ? e.changedTouches[0] : e;
	 	this.updateInertiaParams(point,e)
	    var offset=point.pageY-this.y
	    this.y=point.pageY;
	    var y=this.offset+offset;
	    y=y>=this.maxTop?this.maxTop:y<=this.maxBottom?this.maxBottom:y;//极限值判断
	    this.changeY(y)
	 	
	 }
	 touchEnd(e){
	 	var point = e.changedTouches ? e.changedTouches[0] : e;
	 	 this.slowAction(e,point);
	 	
	 }
	 endScroll(){
	 	var index=Math.round(2-this.offset/this.height)//算出在数值中的位置
		 this.props.onSelect(this.state.data[index],this.props.type);
	 	 this.changeY(this.getY(index),200);
	 }
	 slowAction(e,point){//缓动代码
	 	//计算速度
		var nowTime = e.timeStamp || Date.now();
		var v = (point.pageY - this.lastMoveStart) / (nowTime - this.lastMoveTime); //最后一段时间手指划动速度  
		console.log(v)
		if(Math.abs(v)<0.35){this.endScroll();return;}
		var dir = v > 0 ? -1 : 1; //加速度方向
		var deceleration = dir * 0.0006 * -1;
		var duration = Math.abs(v / deceleration)*0.8; // 速度消减至0所需时间  
		var dist = v * duration / 2; //最终移动多少 
		var startDistance=this.offset,
		    distDistance=dist,
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
		this.scrollDistAngle(nowTime, startDistance,distDistance, duration);
	 }
	 quartEaseOut(t, b, c, d) {
		return -c *(t/=d)*(t-2) + b; 
	 }
	 scrollDistAngle(nowTime, startDistance,distDistance, duration) {
		var self = this;
		 self.move=false;
		(function(nowTime, startDistance,distDistance, duration) {
			var frameInterval = 13;
			var stepCount = duration / frameInterval;
			var stepIndex = 0;
			(function inertiaMove() {	
				if(self.move){return;}
				var newDistance = self.quartEaseOut(stepIndex, startDistance, distDistance, stepCount);
				self.changeY(newDistance)
				stepIndex++;
				if (stepIndex > stepCount - 1 || newDistance <= self.maxBottom || newDistance >= self.maxTop) {
					self.endScroll();
					return;
				}
				setTimeout(inertiaMove, frameInterval);
			})();
		})(nowTime, startDistance,distDistance, duration);
	};
	 updateInertiaParams(point, event,isStart) {//记录最后一段时间的位置
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
	getText(type){
		switch(type){
			case 'year':return '年';
			case 'month':return '月';
			case 'day':return '日';
			case 'hours':return '时';
			case 'minutes':return '分';
		}
	}
	 render(){
	 	var arr=[];
	 	
	 	this.state.data.forEach((item,index)=>{
	 		arr.push(React.createElement("li", null, item))
	 	})
	 	
	 	return(
	 		React.createElement("div", {className: "picker-viewport datepicker-col-1"}, 
	 			React.createElement("div", {className: "picker-wheel"}, this.getText(this.props.type)), 
	 			React.createElement("ul", {className: "picker-scroll", style: this.state.style, ref: "ul", 
	 			  onTouchStart: this.touchStart.bind(this), 
			onTouchMove: this.touchMove.bind(this), onTouchEnd: this.touchEnd.bind(this)}, 
		 			arr
	 			)
	 		)	
	 	)
	 	
	 }
}
var DatePicker=React.createClass({displayName: "DatePicker",
	getInitialState(){
		return {
			date:new Date(),
			isShow:false
		}
	},
	componentDidMount(){
		var date=this.state.date;
		this.initData(date)
		if(this.props.isShow){
			this.controlShow();
		}
	},
	initData(date){
		this.year=date.getFullYear();//得到年月日
		this.month=date.getMonth()+1;
		this.day=date.getDate();
		this.hours=this.liteTo10(date.getHours());
		this.minutes=this.liteTo10(date.getMinutes());
	},
	liteTo10(num){
		return num<10?'0'+num:num;
	},
	componentWillReceiveProps(nextprops){
		var date=nextprops.nextDate?new Date(nextprops.nextDate):new Date();
		this.initData(date)
		this.setState({
			isShow:nextprops.isShow,
			date:date
		})
	},
	onSelect(data,type){
		var lastyear=this.year,lastmonth=this.month;
		this.props.type=='date' && data[0]=='0' && (data=data[1]);
		this[type]=data;
		var days=TimeUtil.getDate(this.year,this.month);
		
		this.day=this.day>days?days:this.day
		//console.log('day '+this.day)
		if(type!='day' && (TimeUtil.getDate(lastyear,lastmonth) !=days)){
			this.setState({
				date:this.year+'-'+this.month+'-'+this.day
			})
		}
		//console.log(data,type)
	},
	onComfireClick(){//确定
		//console.log(this.year,this.month,this.day);
		this.controlShow();
		var data={type:this.props.type};
		
		if(this.props.type=='time'){
			data.data=this.hours+':'+this.minutes;
		}else if(this.props.type=='date'){
			data.data=this.year+'-'+this.month+'-'+this.day
		}
		this.props.onSelect(data)
	},
	controlShow(){
		this.setState({
			isShow:!this.state.isShow
		})
	},
	render(){
		var value=this.state.date;
		//console.log(this.state)
		var style={
			display:this.state.isShow?'block':'none'
		}
		var arr=[];
		if(this.props.type=='date'){
			arr.push(React.createElement("div", {className: "picker-content"}, React.createElement(DatePickerItem, {data: value, type: "year", onSelect: this.onSelect}), 
					React.createElement(DatePickerItem, {data: value, type: "month", onSelect: this.onSelect}), 
					React.createElement(DatePickerItem, {data: value, type: "day", onSelect: this.onSelect}))
					)
		}else if(this.props.type=='time'){
			arr.push(
				React.createElement("div", {className: "picker-content"}, 
					React.createElement(DatePickerItem, {data: value, type: "hours", onSelect: this.onSelect}), 
					React.createElement(DatePickerItem, {data: value, type: "minutes", onSelect: this.onSelect})
				)
			)
		}
		
		return(
			React.createElement("div", {className: "picker", style: style}, 
				React.createElement("div", {className: "picker-mask", onClick: this.controlShow}), 
				React.createElement("div", {className: "picker-body"}, 
						React.createElement("div", {className: "picker-navbar"}, 
							React.createElement("a", {className: "picker-navbar-btn mui-pull-right", onClick: this.onComfireClick}, "完成"), 
							React.createElement("a", {className: "picker-navbar-btn mui-pull-left", onClick: this.controlShow}, "取消")
						), 						
							arr	
				)
				
			)
			
		)
	}
})