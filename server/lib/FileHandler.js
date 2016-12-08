/*!
 * FileHandler: File操作クラス
 * FileSystem抽象化ライブラリ
 *
 * use: fs, utility
 */

(function(global) {
'use strict'

var fs = require('fs');
var util = require('./utility.js');

/**
 * コンストラクタ
 * @constructor
 * @param {String} fileName ファイル
 * @param {Object} option 初期設定
 */
var FileHandler = function(fileName, option) {
	this.fileName = fileName;

	/* デフォルト設定 */
	this.option = {
		format: 'utf8',
		max: 500
	}
	this.option.merge(option);

	/* なければ作る */
	this.create();
};
module.exports = FileHandler;

/** ファイルを作成する */
FileHandler.prototype.create = function(option) {
	fs.open(this.fileName, 'a', function(){});
};

/** ファイルを削除する */
FileHandler.prototype.delete = function(option) {
	fs.unlink(this.fileName, function(){});
};

/**
 * 設定を変更する
 * @param {Object} option 変更する設定
 */
FileHandler.prototype.setOptions = function(option) {
	this.option.merge(option);
};

/**
 * ファイルを1行ずつ読み込む
 * @param {Function} callback 1行ごとのコールバック
 */
FileHandler.prototype.forEach = function(callback) {
	var my = this;
	fs.readFile(my.fileName, my.option.format, function(err, text) {
		var lines = text.split('\n');
		lines.forEach(function(line) {
			if (line != '') callback(JSON.parse(line));
		});
	});
};

/**
 * ファイルを全行読み込む
 * @param {Function} callback 全行読み込んだ後のコールバック
 */
FileHandler.prototype.read = function(callback) {
	var my = this;
	fs.readFile(my.fileName, my.option.format, function(err, text) {
		var objs = [];
		if (text != undefined && text != null) {
			var lines = text.split('\n');
			lines.forEach(function(line) {
				if (line != '') objs.push(JSON.parse(line));
			});
		}
		callback(objs);
	});
};

/**
 * ファイルを先頭行からn行読み込む
 * @param {Number} n 行数
 * @param {Function} callback コールバック
 */
FileHandler.prototype.head = function(n, callback) {
	var my = this;
	fs.readFile(my.fileName, my.option.format, function(err, text) {
		var lines = text.split('\n');
		var objs = []	;
		var count = 0;
		lines.forEach(function(line) {
			if (count >= n) return false;
			if (line != '') {
				objs.push(JSON.parse(line))
				count++;
			};
		});
		callback(objs);
	});
};

/**
 * ファイルを最終行からn行読み込む
 * @param {Number} n 行数
 * @param {Function} callback コールバック
 */
FileHandler.prototype.tail = function(n, callback) {
	var my = this;
	fs.readFile(my.fileName, my.option.format, function(err, text) {
		var lines = text.split('\n');
		var objs = [];
		var count = 0;
		for (var i = lines.length - 1; i >= 0; i--) {
			if (count >= n) break;
			if (lines[i] != '') {
				objs.unshift(JSON.parse(lines[i]));
				count++;
			};
		}
		callback(objs);
	});
};

/**
 * ファイルの最終行に書き込む
 * @param {Object} props 書き込むオブジェクト
 */
FileHandler.prototype.append = function(props) {
	var my = this;
	/* 上限行数チェックしてから更新 */
	fs.readFile(my.fileName, my.option.format, function(err, text) {
		var lines = text.split('\n');
		lines.push(JSON.stringify(props));
		if (lines.length > my.option.max) {
			lines.shift();
		}
		fs.writeFile(my.fileName, lines.join('\n'), my.option.format);
	});
};

/**
 * ファイルの先頭行に書き込む
 * @param {Object} props 書き込むオブジェクト
 */
FileHandler.prototype.prepend = function(props) {
	var my = this;
	/* 上限行数チェックしてから更新 */
	fs.readFile(this.fileName, this.option.format, function(err, text) {
		var lines = text.split('\n');
		lines.unshift(JSON.stringify(props));
		if (lines.length > my.option.max) {
			lines.pop();
		}
		fs.writeFile(my.fileName, lines.join('\n'), my.option.format);
	});
};


})(global);
