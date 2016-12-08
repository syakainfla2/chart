/*!
 * utility library
 */

(function(factory) {
'use strict';

/**
 * DOM要素オブジェクトを取得する
 * @param {String} select 取得するDOMの名前/#ID/.CLASS
 */
factory.$element = function(select) {
	return document.querySelector(select);
};
factory.$elements = function(selects) {
	return Array.apply(null, document.querySelectorAll(selects));
};

/**
 * 要素を作成する
 * @param {String} tagName タグ名
 * @param {Object} options 生成した要素の初期プロパティ設定
 * @return {Node} element 生成した要素
 */
var $createElement = function(tagName, options) {
	var element;
	if (tagName.match(/^svg$/)) {
		element = document.createElementNS("http://www.w3.org/2000/svg", tagName);
	} else {
		element = document.createElement(tagName);
	}
	element.merge(options);
	return element;
};
factory.$createElement = $createElement;
var $create = function(tagName, options) {
	return $createElement(tagName, options);
}
factory.$create = $create;

/* スタイルシート挿入 */
var $css = function(text, option) {
	var css = $create('style', {
		type: 'text/css',
		innerHTML: text || ''
	});
	css.merge(option);
	$element('head').appendChild(css);
	return css;
};
factory.$css = $css;

/* ロード画面作成 */
var $createLoading = function(imgPath, text, style) {
	var frame = $create('div', {
		style: {
			position: 'fixed',
			width: '100%',
			height: '100%',
			top: 0,
			left: 0,
			backgroundColor: style.backgroundColor || 'rgba(0, 0, 0, 0.7)',
			zIndex: 10
		}
	});
	var loading = $create('div', {
		style: {
			position: 'fixed',
			top: '50%',
			left: '50%',
			transform: 'translate(-50%, -50%)',
			textAlign: 'center',
			color: style.color || '#ffffff',
			zIndex: 11
		}
	});
	var img = $create('img', {
		src: imgPath,
		title: text,
		style: {
			width: style.width || '',
			height: style.height || ''
		}
	});
	loading.appendChild(img);
	if (typeof text === 'string') {
		var label = $create('p', { innerHTML: text });
		loading.appendChild(label);
	}
	frame.appendChild(loading);
	frame.hide();
	$element('body').appendChild(frame);
	return frame;
};
factory.$createLoading = $createLoading;

/**
 * 要素の先頭に追加する (拡張)
 * @param {Node} child 子要素
 */
Node.prototype.prependChild = function(child) {
	this.insertBefore(child, this.firstChild);
};

/** 要素を表示状態にする */
Node.prototype.show = function() {
	this.style.display = '';
	this.style._display = '';
};

/** 要素を非表示状態にする */
Node.prototype.hide = function() {
	this.style.display = 'none';
};

/** 要素の表示状態を切り替える */
Node.prototype.toggle = function() {
	if (this.style.display == 'none') {
		this.show();
	} else {
		this.hide();
	}
};

/** チェックされたら有効化するtargetの登録 */
Node.prototype.connect = function(target, reverseFlag) {
	var my = this;
	this._connectFunc = function() {
		if (reverseFlag === true) {
			target.disabled = my.checked;
		} else {
			target.disabled = !(my.checked);
		}
	};
	this._connectFunc();
	if (this.type == 'radio') {
		var inputs = Array.apply(null, document.getElementsByName(this.name));
		inputs.forEach(function(i) {
			i.on('change', my._connectFunc);
		});
	} else {
		this.on('change', this._connectFunc);
	}
}

/** チェックされたら有効化する登録解除 */
Node.prototype.disconnect = function() {
	var my = this;
	if (this.type == 'radio') {
		var inputs = Array.apply(null, document.getElementsByName(this.name));
		inputs.forEach(function(i) {
			i.RemoveEventListener('change', my._connectFunc);
		});
	} else {
		this.RemoveEventListener('change', this._connectFunc);
	}
}

/** 全ての子を削除 */
Node.prototype.clear = function() {
	while(this.firstChild) this.removeChild(this.firstChild);
};

/**
 * イベントリスナ
 * @param {String} event イベント種別
 * @param {Funcion} callback コールバック
 * @param {Boolean} useCapture キャプチャフェーズ使用フラグ
 * @param {Boolean} transfix 背面に対して通知するフラグ
 */
EventTarget.prototype.on = function(event, callback, useCapture, transfix) {
	if (event === 'drag_ext') this.ondrag_ext(callback, useCapture, transfix);
	if (transfix === true) {
		var my = this;
		my.addEventListener(event, function(e) {
			e.stopPropagation();
			if (useCapture === false) callback(e);
		    var tmp = my.style.display;
		    my.style.display = 'none';
		    var target = document.elementFromPoint(e.clientX, e.clientY);
		    var transEvent = new Event(event);
		    transEvent.clientX = e.clientX;
		    transEvent.clientY = e.clientY;
		    target.dispatchEvent(transEvent);
		    my.style.display = tmp;
			if (useCapture === true) callback(e);
		});
	} else {
		this.addEventListener(event, callback, useCapture || false);
	}
};

/** ドラッグイベント */
EventTarget.prototype.ondrag_ext = function(callback, option) {
	var my = this;
	var op = {
		useCapture: false,
		transfix: false,
		propagate: false,
		prevent: false
	}.merge(option);
	var downEvent, upEvent;
	var x, y, movedX, movedY;
	var move = function(e) {
	    if (!op.propagate) e.stopPropagation();
	    if (!op.prevent) e.preventDefault();
		movedX = x - e.clientX;
		x = e.clientX;
		movedY = y - e.clientY;
		y = e.clientY;
		callback(
			{ x: x, y: y, movedX: movedX, movedY: movedY },
			e
		);
	};
	var up = function(e) {
	    if (!op.propagate) e.stopPropagation();
	    if (!op.prevent) e.preventDefault();
		upEvent = e;
		my.removeEventListener('mousemove', move);
		my.removeEventListener('mouseup', up);
		my.removeEventListener('mouseout', up);
	}
	this.on('mousedown', function(e) {
	    if (!op.propagate) e.stopPropagation();
	    if (!op.prevent) e.preventDefault();
		downEvent = e;
		x = e.clientX;
		y = e.clientY;
		my.on('mousemove', move, op.useCapture, op.transfix);
		my.on('mouseup', up, op.useCapture, op.transfix);
		my.on('mouseout', up, op.useCapture, op.transfix);
	}, op.useCapture, op.transfix);
};

/**
 * プロパティのマージ/Deep copy
 * @param {Object} obj マージ対象のオブジェクト
 * 重複した場合、上書きする
 */
if (Object.prototype.merge === undefined) {
var merge = function(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
			if (obj[key] instanceof Array) {
				// Array
				this[key] = obj[key].slice();
			} else if (typeof obj[key] == 'object') {
				// Object
			    if (this[key] !== undefined) {
					this[key].merge(obj[key]);
				} else {
					this[key] = {};
					this[key].merge(obj[key]);
				}
			} else {
				// else
            	this[key] = obj[key];
			}
        }
    }
	return this;
}
Object.defineProperty(Object.prototype, "merge", { value: merge });
}

/**
 * 指定したオブジェクトとのマッチング
 * @param {Object} target key:valueの組み合わせ
 * @return {Boolen} ret 指定されたkey:valueを全て保持しているか否か
 */
var has = function(target) {
	var my = this;
	var keys = Object.keys(target);
	var isHit = false;
	if (keys.length > 0) isHit = true;
	Object.keys(target).forEach(function(key) {
		var val = target[key];
		var i = key;
		if (my instanceof Array) i = parseInt(i, 10);
		if (my[i] instanceof Array) {
			// Array
			if (my[i].has(val) == false) {
				isHit = false;
				return false;
			}
		} else if (typeof my[i] === 'object') {
			// Object
			if (typeof val === 'object') {
				if (my[i].has(val) == false) {
					isHit = false;
					return false;
				}
			} else {
				isHit = false;
				return false;
			}
		} else {
			// else
			if (my[i] !== val) {
				isHit = false;
				return false;
			}
		}
	});
	return isHit;
}
Object.defineProperty(Object.prototype, "has", { value: has, writable: true });

/**
 * 特定文字のカウント
 * @param {String|RegExp} char カウント対象の文字|パターン
 * @return {Int} count 対象の文字の個数
 */
String.prototype.count = function(char) {
	var count = 0;
	if (typeof char === 'string') {
		count = this.split(char).length - 1;
	} else {
	 	count = (this.match(char) || []).length;
	}
	return count;
}

/** 末尾要素の取得 */
Array.prototype.last = function(n) {
	if (typeof n === 'number') {
		this[this.length - 1] = n;
	}
	return this[this.length - 1];
}

/**
 * 要素の拡張
 * @param {Number} n 拡張するサイズ
 * @param {Object} init 初期値
 */
Array.prototype.assign = function(n, init) {
	var diff = n - this.length;
	for (var i = 0; i < diff; i++) {
		this.push(init);
	}
};

/**
 * 要素の検索
 * @param {Object} target hitさせたいkey:valueのみを持つオブジェクト
 */
Array.prototype.search = function(target) {
	if (typeof target != 'object') {
		var index = this.indexOf(target);
		if (index >= 0) {
			return this[index];
		} else {
			return null;
		}
	}
	var ret = null;
	this.forEach(function(val) {
		if (val.has(target)) {
			ret = val;
			return false;
		}
	});
	return ret;
}

/** 連想配列の指定されたプロパティの合計値を求める */
Array.prototype.sum = function(key) {
	var sum = 0;
	this.forEach(function(v) {
		if (typeof v[key] === 'number') {
			sum += v[key];
		}
	});
	return sum;
}

/**
 * 要素の拡張
 * @param {Number} n 拡張するサイズ
 */
Number.prototype.float = function(n) {
	var carry = Math.pow(10, n);
	var ret = this * carry;
	ret = Math.round(ret);
	ret /= carry;
	return ret;
};

/**
 * 非同期/順次実行クラス
 * @constructor
 * @param {Number} msec インターバル
 * 同じインスタンスに登録された関数を、インターバルを挟んで順次実行する
 */
var $Task = function(msec) {
	this._jobs = new Array();
	this._isRunning = false;
	this._interval = msec;
};
factory.$Task = $Task;

/**
 * 処理を追加/実行する
 * @param {Function} func
 * @return {Function} add コールバック設定関数
 * @api public
 * 実行する処理を追加し、順番がきたら実行する。
 * 他に未実行の処理がなければ、即時実行される。
*/
$Task.prototype.add = function(func) {
	this._jobs.push(func);
	if (this._isRunning == true) { return; }
	this._isRunning = true;
	var my = this;
	var timer = setInterval(function() {
		try {
			my._jobs[0]();
		} catch(e) {
			console.log(e);
		}
		my._jobs.shift();
		if (my._jobs.length <= 0) {
			clearInterval(timer);
			my._isRunning = false;
		}
	}, my._interval ? my._interval : 0);
	return function(callback) { my.add(callback) };
};


/**
 * 非同期実行
 * @param {Function} func 実行する関数
 * @param {Number} delay 遅延時間
 */
var $async = function(func, delay) {
	var task = new $Task(delay ? delay : 0);
	return task.add(func);
};
factory.$async = $async;

/**
 * jsファイル順次読み込み関数
 * @param {String|Function} uri jsファイルアドレス
 * @param {String} id jsファイルを読み込むscriptタグに付与するID
 * 本関数コール順に、jsファイルを非同期で読み込む
 * 第一引数[uri]が関数の場合、直前のjsファイル読み込み後に処理される
 */
var jsTask = new $Task(100);
var jsImported = Array();
factory.$jsImport = function(uri, id) {
	if (typeof uri == 'function') {
		jsTask.add(uri);
		return;
	}

	/* jsファイル読み込み */
	// 重複チェック
	for (var i = 0; i < jsImported.length; i++) {
		if (jsImported[i] == uri) { return; }
	}
	jsImported.push(uri);
	// 読み込み
	var js = document.createElement('script');
	js.type = 'text/javascript';
	if (id != null) { js.id = id; }
	js.src = uri;
	jsTask.add(function() {
		$element('head').appendChild(js);
	});
};

/**
 * cssファイル読み込み関数
 * @param {String} uri cssファイルアドレス
 * @param {String} id cssファイルを読み込むscriptタグに付与するID
 * cssファイルを読み込む
 */
var cssImported = Array();
factory.$cssImport = function(uri, id) {
	// 重複チェック
	for (var i = 0; i < cssImported.length; i++) {
		if (cssImported[i] == uri) { return; }
	}
	cssImported.push(uri);
	// 読み込み
	var css = document.createElement('link');
	css.rel = 'stylesheet';
	css.type = 'text/css';
	if (id != null) { css.id = id; }
	css.href = uri;
	$element('head').appendChild(css);
};

/** 時間取得 */
var $clock = {};
factory.$clock = $clock;
/** ミリ秒取得 */
$clock.time = function() {
	var time = new Date();
	return time.getTime();
};
/** ミリ秒のみ取得 */
$clock.msec = function() {
	var time = new Date();
	return time.getMilliseconds();
};
/** 秒取得 */
$clock.sec = function() {
	var time = new Date();
	return time.getSeconds();
};

/**
 * HTML生成
 * @param {String} code htmlコード
 */
var $HTML = function(code) {
	var element = document.createElement('element');
	if (arguments.length === 1) {
		element.innerHTML = code;
	} else {
		var args = Array.apply(null, arguments);
		element.innerHTML = args.join('');
	}
	return element;
};
factory.$HTML = $HTML;


/* windowロード完了後の処理 */
window.on('load', function() {
	/* disable connect */
	$elements('input').forEach(function(input) {
		/* connect */
		var connectTarget = input.getAttribute('connect');
		if (connectTarget != null && connectTarget != '') {
			var connectTargets = connectTarget.split(' ');
			connectTargets.forEach(function(c) {
				if (/^\..+$/.test(c)) {
					$elements(c).forEach(function(e) {
						input.connect(e);
					})
				} else {
					input.connect($element(c));
				}
			});
		}
	});

	/* 入力内容の保存と反映 */
	$elements('.memorize').forEach(function(input) {
		input.on('change', function() {
			$cache.save({ [input.id]: input.value });
		});
		var value = $cache.get(input.id);
		if (value != null && value != '') {
			input.value = value;
		}
	});
});

})(window);
