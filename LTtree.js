/*
 * @Author: Terence 
 * @Date: 2018-03-27 15:18:11 
 * @Last Modified by:   Terence
 * @Last Modified time: 2018-06-21 11:16:22
 */

 /**
  * 
  * @param {DOM} container  原生DOM节点
  * @param {Object || Array} data 需要渲染的树结构数据
  * @param {String} way 单项选择 还是 范围选择 默认单选 'single'   ****还未实现****
  * @param {String} level  [a, b, c, ...] 需要渲染到的层级, 默认与数据结构的层数相同
  * @param {Object} arguConfig 参数类型{name: "N", children: "C"}，若不传则默认使用高木学习数据结构
  * @param {Function} callback 点击数结构的回调函数
  * @param {Function} expand 第一次展开时执行的方法   此方法的返回值可以替换当前的子节点数据
  * @param {Function} fold 每次折叠时执行的方法
  * @param {String} stopKey 树数据中遇到此属性，停止向下渲染
  * @param {Array} eteKey 固定返回属性
  * 
  * 
  * {$_$Tree, update} 为外部可调用方法，其他禁止外部使用
  * 
  * @return $_$Tree
  * 
  */

;(function() {
	var $_$Tree = function (params) {
		return new Tree(params);
	}
	
	function Tree(params) {
		/********************  在此处定义 全局变量  ******************/
		this.wrap = params.container;       //保存最外层的DOM元素
		this.level = params.level;          //level 表示 树结构 最深处有几层数据,  render 参数的 index 表示 想要渲染 第几层 的数据
		this.isSingle = (!params.way || params.way === 'single') ? true : false;     //设置是 单项选择 还是 范围选择
		this.cb = params.callback;
		this.aKey = [];
		this.arguConfig = params.arguConfig ? params.arguConfig : { name: "name", children: "children" };
		this.data = params.data;
		this.expand = params.expand;
		this.fold = params.fold;
		this.stopKey = params.stopKey;
		this.eteKey = params.eteKey;
		this.temp;                          //保存上一次选中的节点
		this.queryData = {};
		/********************  在上处定义 全局变量  ******************/
	
		this.init(this.data);
	}
	
	/**
	 * 初始化，只执行一次
	 * 
	 * @param {JSON} data 要渲染的数据
	 */
	Tree.prototype.init = function(data) {
	
		//在树组件最外层绑定事件
		var This = this;
	
		this.wrap.onclick = function(ev) {
			This.act.call(This, ev);
		}
	
		//禁止文字选中
		this.wrap.onselectstart = function () {
			return false;
		}
		this.update(data);
	}
	
	/**
	 * 树组件更新或重新渲染, 此方法可以外部调用
	 * 
	 * @param {Array} data 
	 */
	Tree.prototype.update = function(data) {
		var r = this.formatData(data);
		var d = r.data;
		if (!r.result) {
			return console.warn(r.msg);
		}
		var str = '<div gmTree="gm_tree"></div>';
		this.wrap.innerHTML = str;
		var oGm_tree = this.wrap.querySelector('[gmTree="gm_tree"]');
		this.render(oGm_tree, d, 'a');
	}
	
	/**
	 *  处理传进来的数据，如果是Object，渲染的数据字段必须为data
	 * 
	 * @param {Array || Object} data
	 */
	Tree.prototype.formatData = function(data) {
		//检查传入的数据
		var ret;
		if (typeof data == 'string') {
			data = JSON.parse(data);
		}
		switch (data.constructor) {
			case Array:
				data = data;
				ret = {
					result: true,
					data: data
				}
			break;
			case Object:
				if (data.data) {
					data = data.data;
				} else {
					return ret = {
						result: false,
						msg: "传入JSON数据请树结构的key值设置成data"
					}
				}
				ret = {
					result: true,
					data: data
				}
			break;
			default:
				ret = {
					result: false,
					msg: "传入的数据有误, 请传入JSON数组或包含data的json数据"
				}
			break;
		}
		return ret;
	}
	
	/**
	 * 若该节点已有内容则 打开 不渲染
	 * 
	 * @param {DOM} parent 要渲染到的父亲节点
	 * @param {JSON} data 要渲染的数据
	 * @param {string} index ['a' ,'b'...] 要渲染的层级
	 * 
	 */
	Tree.prototype.render = function(parent, data, index) {
		//如果没有数据产生的子节点就生成，否则什么都不做
		if (!parent.querySelector('[gmIndex]') && data) {
			var str = '';
			var fQw = parent.getAttribute('qw');
			fQw = fQw ? fQw : '';
			var isF;
			this.aKey = [];             //保存数据属性key值
			
			if (this.eteKey) {
				this.aKey = this.eteKey;
			} else {
				for (k in data[0]) {
					this.aKey.push(k);
				}
			}
	
			for (var i = 0; i < data.length; i++) {
				/**
				 * @var {Array} reV 要返回的属性和值，偶数为key，奇数为value
				 * @var {Array} noReV 不返回的属性和值，偶数为key，奇数为value
				 * @var {String} prop 保存着this.aKey的属性名
				 * @var {String} val 根据prop在参数data中获取的属性值
				 * @var {String} sProp 设置DOM上属性的字符串
				 * @var {String} N 要显示在“树杈”上的内容
				 * @var {Array} C 子节点的数组
				 */
				var reV = [], noReV = [], prop = '', val = '', sProp = '', N = '', C = '';
				for (var j = 0; j < this.aKey.length; j++) {
					prop = this.aKey[j];
					val = data[i][prop];
					/**
					 * 由子节点的数据量过大，要返回的数据都保存在DOM节点上，html结构太庞大
					 * 所以子节点字段额外添加
					 */
					if (val != "undefined" && prop != this.arguConfig.children) {
						if (typeof val == 'object') {
							val = JSON.stringify(val);
						}
						reV.push(prop);
						reV.push(val);
					} else {
						noReV.push(prop);
						noReV.push(val);
					}
				}
	
				for (var j = 0; j < reV.length; j++) {
					if (j % 2 == 0) {
						sProp += reV[j] + '=';
					} else {
						sProp += reV[j] + 'あ';         //あ(v4=a) 设置的时候用空格替换
					}
				}
	
				sProp = sProp.replace('id', '____id');
				sProp = sProp.replace(/\s+/g,'ぃ');     //将空格设置成ぃ(搜狗输入法v4=b)  等到在返回时候用空格替换
				sProp = sProp.replace(/あ/g, ' ');      //将 あ(v4a) 替换成空格
				// console.log(sProp);
	
				N = data[i][this.arguConfig.name];
				C = data[i][this.arguConfig.children];
	
				this.queryData[fQw + index + i] = C;
	
				// index === this.level 将要渲染的数据层数 与 设定的渲染层数据 是否相等
				
				isF = (
					!(C && C.length) || 
					index === this.level || 
					(this.stopKey && (this.stopKey in data[i]))
				) ? 'none' : 'false';
	
				
				/**
				 * qw属性 用来在this.queryData查找数据;
				 * gm_act="onOff"  用来切换关闭隐藏
				 * on="none"  表示没有子数据了
				 */
				str += '<div gmIndex="'+ index +'" qw="'+ fQw + (index + i) +'"><span gm_act="onOff" on="'+ isF +'"></span><span gmTree="gm_title" gm_act="selected"'+ sProp +'">'+ N +'</span></div>';
			}
			parent.innerHTML += str;
		} else {
			console.warn('已经渲染过节点 或者 需要渲染的数据错误');
		}
	}
	
	/**
	 * 树组件所有的点击事件
	 * 
	 * @param {Object} ev 
	 */
	Tree.prototype.act = function(ev) {
		var target = ev.target;
		var act = target.getAttribute("gm_act");
		switch(act) {
			case "onOff":
				if (target.getAttribute("on") == 'false') {
					// console.log('下级节点展开');
					target.setAttribute("on", 'true');
					var parent = target.parentNode;
					if (parent.querySelector('[gmIndex]')) return;       //查找点击的节点的子节点是否有数据，如果有表示展开，否则渲染新节点
					/**
					 * @var {DOM} parent 点击元素的父节点
					 * @var {String} qw 查找数据需要的属性
					 * @var {Array} childData 根据点击的节点获取 此节点的子节点数据
					 * @var {String} index 点击节点的层数
					 * @var {String} nextIndex 获取到下一层的层数
					 * @var {Array || undefined} newData 点击展开按钮返回的数据
					 */
					var qw = parent.getAttribute('qw'),
						childData = this.queryData[qw],
						index = parent.getAttribute('gmIndex'),
						nextIndex = this.getNextIndex(index),
						newData;
					var ret = this.getReKey(target.nextSibling, this.aKey);
	
					if (childData) {
						if ((this.eteKey && ('C' in this.eteKey)) || !this.eteKey) {
							ret[this.arguConfig.children] = childData;
						}
					}
					if (this.expand) {
						newData = this.expand(ret);
						childData = newData ? newData : childData;
					}
					
					this.render(parent, childData, nextIndex);
				} else if (target.getAttribute("on") == 'true') {
					this.fold && this.fold();
					target.setAttribute("on", 'false');
					// console.log('下级节点隐藏');
				} else {
					console.warn('没有下级节点了');
				}
				break;
			case "selected":
				//单点击选择 或 范围选择（点击两次）    仅实现单选
	
				//记录点击节点，在下次点击的时候清空上一点击节点的active，并记录本次点击节点
				var parent = target.parentNode;
				if (this.temp) {
					this.temp.setAttribute('class', '');
				}
				parent.setAttribute('class', 'active');
				this.temp = parent;
				var qw = this.temp.getAttribute('qw');
				var ret = this.getReKey(target, this.aKey);
				if (this.queryData[qw]) {
					if ((this.eteKey && ('C' in this.eteKey)) || !this.eteKey) {
						ret[this.arguConfig.children] = this.queryData[qw];
					}
				}
				this.cb && this.cb(ret);
				break;
			default:;
		}
	}
	
	/**
	 * 获取想要返回的属性
	 * 
	 * @param {DOM} target 目标DOM节点
	 * @param {Array} aKey 保存属性名的数组
	 */
	Tree.prototype.getReKey = function(target, aKey) {
		var ret = {};
		//找到this.aKey配置的要返回的属性
		for (var i = 0; i < aKey.length; i++) {
			var k = aKey[i];
			var v = target.getAttribute(k == 'id' ? '____id' : k);
			
			if (v != null && v != "undefined") {
				v = v.replace(/ぃ/g, ' ');
				ret[k] = v;
			}
		}
		return ret;
	}
	
	/**
	 * 根据传入的层级，获取到下一层级
	 * 
	 * @param {string} ['a','b','c','d','e'...] index 
	 * @return {string} ['a','b','c','d','e'...] index 
	 */
	Tree.prototype.getNextIndex = function(index) {
		return String.fromCharCode(index.charCodeAt() + 1);
	}

	if (typeof module !== 'undefined' && typeof exports === 'object') {
		module.exports = $_$Tree;
	} else {
		window.$_$Tree = $_$Tree;
	}
	
})();
