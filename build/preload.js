(function() {
	if (typeof window.CustomEvent === 'undefined') {
		function CustomEvent(event, params) {
			params = params || {
				bubbles: false,
				cancelable: false,
				detail: undefined
			};
			var evt = document.createEvent('Events');
			var bubbles = true;
			for (var name in params) {
				(name === 'bubbles') ? (bubbles = !!params[name]) : (evt[name] = params[name]);
			}
			evt.initEvent(event, bubbles, true);
			return evt;
		};
		CustomEvent.prototype = window.Event.prototype;
		window.CustomEvent = CustomEvent;
	}
})();
window.mui={};
(function($, window) {
	function detect(ua) {
		this.os = {};
		var funcs = [

			function() { //wechat
				var wechat = ua.match(/(MicroMessenger)\/([\d\.]+)/i);
				if (wechat) { //wechat
					this.os.wechat = {
						version: wechat[2].replace(/_/g, '.')
					};
				}
				return false;
			},
			function() { //android
				var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/);
				
				if (android) {
					this.os.android = true;
					this.os.version = android[2];

					this.os.isBadAndroid = !(/Chrome\/\d/.test(window.navigator.appVersion));
				}
				return this.os.android === true;
			},
			function() { //ios
				var iphone = ua.match(/(iPhone\sOS)\s([\d_]+)/);
				if (iphone) { //iphone
					this.os.ios = this.os.iphone = true;
					this.os.version = iphone[2].replace(/_/g, '.');
				} else {
					var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
					if (ipad) { //ipad
						this.os.ios = this.os.ipad = true;
						this.os.version = ipad[2].replace(/_/g, '.');
					}
				}
				return this.os.ios === true;
			},
			function(){
				var plus = ua.match(/Html5Plus/i); //TODO 5\+Browser?
				if (plus) {
					this.os.plus = true;
				};
			}
		];
		[].every.call(funcs, function(func) {
			
			return !func.call($);
		});
	}
	detect.call($, navigator.userAgent);
})(window.mui, window);
(function($){
	$.isWindow = function(obj) {
		return obj != null && obj === obj.window;
	};
	/**
	 * mui isObject
	 */
	$.type = function(obj) {
		var class2type={};
		return obj == null ? String(obj) : class2type[{}.toString.call(obj)] || "object";
	};
	$.isObject = function(obj) {
		return $.type(obj) === "object";
	};
	/**
	 * mui isPlainObject
	 */
	$.isPlainObject = function(obj) {
		return $.isObject(obj) && !$.isWindow(obj) && Object.getPrototypeOf(obj) === Object.prototype;
	};
	$.fire = function(webview, eventType, data) {
		if (webview) {
			if (data !== '') {
				data = data || {};
				if ($.isPlainObject(data)) {
					data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
				}
			}
			webview.evalJS("typeof mui!=='undefined'&&mui.receive('" + eventType + "','" + data + "')");
		}
	};
	
	$.receive = function(eventType, data) {
		if (eventType) {
			try {
				if (data) {
					data = JSON.parse(data);
				}
			} catch (e) {}
			$.trigger(document, eventType, data);
		}
	};
$.trigger = function(element, eventType, eventData) {
		element.dispatchEvent(new CustomEvent(eventType, {
			detail: eventData,
			bubbles: true,
			cancelable: true
		}));
		return this;
	};
   $.plusReady=function(fun){
   	 if(window.plus){
   	 	fun()
   	 }else{
   	 	document.addEventListener('plusready',fun)
   	 }
   }
	return $;
	
})(window.mui)
console.log( navigator.userAgent)
console.log(mui.os.android)
Preload={
	url:"http://172.18.0.79:8892/WOM",
	pre:{},
	pages:{},
	
	show:function(id,animate){
		var _this=this;
		animate=animate||"slide-in-right";
		//this.pages[id].setVisible(false)
		plus.webview.show(id,animate,250,function(){			
				},{acceleration:"auto"})
	},
	//showPage:function(url,id,data,animate){
	showPage:function(id,data,animate){	
		//this.override(id)
		if(data){
			var detailPage = plus.webview.getWebviewById(id);
			var json={};
		//	mui.extend(json,data);
			//alert(json.id)
			mui.fire(detailPage,id,data);
		}
		this.show(id,animate)	
	},
	preloadPage:function(data,name){
		if(data&&(data.length>0)&&(!this.pre[name])){
			this.pre[name]=true;	
			var _this=this;
			data.forEach(function(item,index){
	     		_this.pages[item.id]=plus.webview.create(item.url,item.id,
	     			{softinputMode:"adjustResize",scrollIndicator:'none',backButtonAutoControl:'hide'});
			
			})
		}
		
		
	},
	ajax:function(json){
		//console.log()
		$.ajax({
			        type : json.type||"get",
			        cache : false,
			        url : this.url+json.url,
			        data : json.data||{},
			        jsonp: "jsonpCallback",
			        timeout: json.timeout || 0,
			        success : function(data) {
			        	json.fun(data)
			           
			        },
			        error : function() {
			        	//mui.toast("操作失败")
			        	json.err || plus.nativeUI.toast('操作失败')
			        }
			    });
	},
	back:function(){
		var _this=this;
		
	},
	hide:function(){
		plus.webview.currentWebview().hide("pop-out");
	}
}
var TouchFeed=(function(c){
	   	  var eventData={},feedbackClass='touch-feed-back'; 
		  var classUtil = {
            hasClass: function (elem, cls){
                cls = cls || '';
                if(cls.replace(/\s/g, '').length == 0) return false;
                return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
            },
            addClass: function (elem, cls){
                if(!this.hasClass(elem, cls)){
                	elem.className += ' ' + cls;
                }
            },
            removeClass: function (elem, cls){
                if(this.hasClass(elem, cls)){
                    var newClass = ' ' + elem.className.replace(/[\t\r\n]/g, '') + ' ';
                    while(newClass.indexOf(' ' + cls + ' ') >= 0){
                        newClass = newClass.replace(' ' + cls + ' ', ' ');
                    }
                    elem.className = newClass.replace(/^\s+|\s+$/g, '');
                }
            },
            closest: function (elem, attribute) {
                var cur, match;
                for (cur = elem; cur; cur = cur.parentNode) {
                    if (cur.nodeType < 11 && cur.nodeType === 1 && cur.getAttribute(attribute) === 'true') {
                        break;
                    }
                }
                return cur;
            }
        };
		c.componentWillMount=function(){
			
			//React.initializeTouchEvents(true)
		}
		c.touchStart=function(e){
			var event = e.changedTouches ? e.changedTouches[0] : e,
                identifier = eventData[event.identifier] = {};
            identifier.startY = event.pageY;
            identifier.startX = event.pageX;
            identifier.target = classUtil.closest(event.target, 'data-feedback');
            if (identifier.target) {
                classUtil.addClass(identifier.target, feedbackClass);
            }
		}
		/*c.touchMove=function(e){
			var event = e.changedTouches ? e.changedTouches[0] : e,
                identifier = eventData[event.identifier];
            if (identifier.target && event.target && Math.abs(identifier.startY - event.pageY) > 0) {
                //classUtil.removeClass(identifier.target, feedbackClass);
            }
		}	*/
		c.touchCancel=function(e){
			 var event = e.changedTouches ? e.changedTouches[0] : e,
                identifier = eventData[event.identifier];
            if (identifier.target) {
                classUtil.removeClass(identifier.target, feedbackClass);
            }
            delete eventData[event.identifier];
		}
		return c;
 })({})	
 var Observe = (function() {
           var subscribe, obj, one, remove, publish, __this;
           obj = {};  __this = this;
           subscribe = function( key, eventfn ) { //订阅 
             var stack, _ref;  //stack放入订阅函数
             stack = ( _ref = obj[key] ) != null ? _ref : obj[ key ] = [];
             stack.push( eventfn );
           };
           one = function( key, eventfn ) {
             remove( key );
             subscribe( key, eventfn );
           };
           remove = function( key ) {
             var _ref;
			if(( _ref = obj[key] ) != null){
				_ref=null;
				delete obj[key]
			}
           };
           publish = function(key,data) {  //发布
             var fn, stack, _i, _len, _ref;
             stack = ( _ref = obj[ key ] ) != null ? _ref : obj[ key ] = [];
             for ( _i = 0, _len = stack.length; _i < _len; _i++ ) {
               fn = stack[ _i ];
               fn.call( __this,  data ) 
             }
		   }
             return {
                subscribe: subscribe,
                one: one,
                remove: remove,
                publish: publish
             }
     }	)()
		   