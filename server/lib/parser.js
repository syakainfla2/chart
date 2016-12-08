/*!
 * FileHandler: File操作クラス
 * FileSystem抽象化ライブラリ
 *
 * use: fs, utility
 */

(function(global) {
'use strict'


/** ハンドル */
var $parser = {};

module.exports = $parser;

/* prototype拡張 */

/**
 * リンクにする
 * @param {Object} option 設定
 */
String.prototype.toLink = function(option) {
	var opt = {
		className: 'thumnail'
	}.merge(option);
	var str = this.replace(/(((https?|ftp|file):\/\/)|blob:.*\/)[^\s]+/g, '<a href="$&" target="_blank">$&</a>');
	if (option === undefined || option.thumbnail != false) {
		str = str.replace(/>(https?:\/\/[^\s]+(\.jpg|\.jpeg|\.png|\.gif|\.bmp))</g,
			'><img src="$1" class="' + opt.className + '" title="$1"></img><');
		// blob
		str = str.replace(/>(blob:.*\/[^<]+)</g,
			'><img src="$1" class="' + opt.className + '"></img><');
	}
	return str;
};

/** <>&エスケープ */
String.prototype.escapeHTML = function() {
	var escapeList = {
		"<": "&lt;",
		">": "&gt;",
		"&": "&amp;",
		"'": "&apos;",
		'"': "&quot;"
	};
	function escape(char) { return escapeList[char]; }
	return this.replace(/<|>|&|'|"/g, escape);
};

/** 改行タグにする */
String.prototype.br = function() {
	return this.replace(/\r\n|[\r\n]/g, '<br>');
};

/** 数値部分だけ抜き出してNumberを返す */
String.prototype.toNumber = function() {
	return parseInt(this.replace(/[^0-9]/g, ''), 10);
};


})(global);
