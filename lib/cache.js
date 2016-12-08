/*!
 * Cache utility
 *   localStorageやCookieを駆使して情報の保存/読み込みを行う
 */

(function(factory) {
'use strict';

/** キャッシュハンドル */
factory.$cache = {};

/** クッキーハンドル */
$cache.cookie = {};
/** localStorageハンドル */
$cache.storage = {};

/*
 * Cookie API
 *
 */

/**
 * クッキーに保存する
 * @param {Object} data 保存するデータ
 * @api public
 */
$cache.cookie.save = function(data) {
	var cookies = '';
	Object.keys(data).forEach(function(key) {
		if (key == 'max_age' && typeof data[key] === 'number') {
			key = 'max-age';
		}
		cookies += [
			encodeURIComponent(key), '=',
			encodeURIComponent(data[key]), '; '
		].join('');
	});
	if (typeof data.max_age !== 'number' &&
	    typeof data.expires !== 'number') {
		cookies += 'max-age=' + (60*60*24*365) + ';'; // 1年
	}
	document.cookie = cookies;
};

/**
 * クッキーを取得する
 * @param {Object} key 取得する値のキー
 * @return {String} value キーに設定されているデータ
 * @api public
 */
$cache.cookie.get = function(key) {
	var value = null;
	var cookies = document.cookie.split('; ');
	key = encodeURIComponent(key);
	cookies.forEach(function (line) {
		var cookie = line.split('=');
		if (cookie[0] == key) {
			value = cookie[1];
			value = decodeURIComponent(value);
		}
	});
	return value;
};

/**
 * クッキーを削除する
 * @param {String} keys 削除するデータのキー(複数可)
 * @api public
 */
$cache.cookie.remove = function() {
	var keys = Array.apply(null, arguments);
	var data = {};
	keys.forEach(function(key) {
		if (typeof key === 'string') {
			key = encodeURIComponent(key);
			data[key] = '';
		} else {
			key.forEach(function (k) {
				k = encodeURIComponent(k);
				data[k] = '';
			});
		}
	});
	data.max_age = 0;
	$cache.cookie.save(data);
};


/*
 * localStorage API
 *
 */

/**
 * ストレージに保存する
 * @param {Object} data 保存するデータ
 * @api public
 */
$cache.storage.save = function(data) {
	Object.keys(data).forEach(function(key) {
		localStorage.setItem(key, data[key]);
	});
};

/**
 * ストレージから取得する
 * @param {Object} key 取得する値のキー
 * @return {String} value キーに設定されているデータ
 * @api public
 */
$cache.storage.get = function(key) {
	return localStorage.getItem(key);
};

/**
 * ストレージから削除する
 * @param {String} keys 削除するデータのキー(複数可)
 * @api public
 */
$cache.storage.remove = function() {
	var keys = Array.apply(null, arguments);
	keys.forEach(function(key) {
		if (typeof key === 'string') {
			localStorage.removeItem(key);
		} else {
			key.forEach(function(k) {
				localStorage.removeItem(k);
			});
		}
	});
};


/*
 * Cache functions
 *
 */

/**
 * クッキーとストレージにデータを保存する
 * @param {Object} data 保存するデータ
 * @api public
 */
$cache.save = function(data) {
	$cache.cookie.save(data);
	$cache.storage.save(data);
};

/**
 * ストレージかクッキーからデータを取得する
 * @param {Object} key 取得する値のキー
 * @return {String} value キーに設定されているデータ
 * @api public
 */
$cache.get = function(key) {
	var value = $cache.storage.get(key);
	if (value == null) {
		value = $cache.cookie.get(key);
	}
	return value;
};

/**
 * ストレージとクッキーからデータを削除する
 * @param {String} keys 削除するデータのキー(複数可)
 * @api public
 */
$cache.remove = function(key) {
	var keys = Array.apply(null, arguments);
	$cache.cookie.remove(keys);
	$cache.storage.remove(keys);
};


})(window); // this file scope
