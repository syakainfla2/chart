/*!
 * util: ユーティリティAPIハンドラ
 * 汎用ユーティリティライブラリ
 *
 */

(function(global) {
'use strict'

/** APIハンドラ */
var util = {};


/** 時間取得 */
var $clock = {};
util.$clock = $clock;
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


/* ------- prototype extensions ------- */

/**
 * プロパティのマージ
 * @param {Object} obj マージ対象のオブジェクト
 * 重複した場合、上書きする
 */
Object.prototype.merge = function(obj) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
			if (typeof obj[key] == 'object') {
			    if (this[key] !== undefined) {
					this[key].merge(obj[key]);
				} else {
					this[key] = {};
					this[key].merge(obj[key]);
				}
			} else {
            	this[key] = obj[key];
			}
        }
    }
	return this;
}
//Object.defineProperty(Object.prototype, "merge", { value: merge });


module.exports = util;

})(global);
