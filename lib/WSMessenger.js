/*!
 * WSMessenger: websocketのイベント送受信抽象化クラス
 * websocket系ユーティリティライブラリ
 */

(function(factory) {
'use strict'

/**
 * コンストラクタ
 * @constructor
 + @param {WebSocket} ws websocketインスタンス
 */
factory.WSMessenger = function(ws) {
	this._ws = ws;             //!< websocket
	this._listeners = Array(); //!< リスナ
	this._binary_text = [];
	this._binary_callback = [];

	/* websocketにリスナ登録 */
	var my = this;
	this._ws.onopen = function() { my._notify('open') };
	this._ws.onclose = function() { my._notify('close') };
	this._ws.onmessage = function(message) {
		if (typeof message.data === 'string') {
			var msg = JSON.parse(message.data);
			my._notify(msg.event, msg.data);
		} else {
			// textのackきてからnotify
			var ack = my.on('ack_binary_text', function(text) {
				if (text.ack == ack) {
					my.off(ack);
					my._notify('binary', message.data, text);
				}
			});
			// textをrequest
			my.send('req_binary_text', { ack: ack });
		}
	};

	// binaryのtext要求きたら、ペンディング中のテキストメッセージを送信
	this.on('req_binary_text', function(msg) {
		var data = my._binary_text[0];
		data.ack = msg.ack;
		my.send('ack_binary_text', data);
		my._binary_callback[0]();
		my._binary_text.shift();
		my._binary_callback.shift();
	});
}

/**
 * イベントリスナ登録
 * @param {String} event イベント種別
 * @param {Function} callback コールバック関数
 * @return {Number} id 削除用ID
 * @api public
 */
var _count = 0;
WSMessenger.prototype.on = function(event, callback) {
	_count++;
	var listener = {
		event: event,
		callback: callback,
		id: _count
	};
	this._listeners.push(listener);
	return listener.id;
};

/**
 * イベントリスナ削除
 * @param {Number} id ID
 * @api public
 */
WSMessenger.prototype.off = function(id) {
	var my = this;
	this._listeners.forEach(function(listener, i) {
		if (listener.id == id) {
			my._listeners.splice(i, 1);
		}
	});
};

/**
 * メッセージ送信
 * @param {String} event イベント種別
 * @param {Object} message メッセージオブジェクト
 * @api public
 */
WSMessenger.prototype.send = function(event, message, text, callback) {
	if (event == 'binary') {
		this._ws.send(message);
		this._binary_text.push(text);
		this._binary_callback.push(function() {
			if (typeof callback === 'function') {
				callback();
			}
		});
	} else {
		var msg = { event: event, data: message };
		this._ws.sendJSON(msg);
	}
};

/**
 * イベント通知
 * @param {String} event イベント種別
 * @param {Object} message メッセージオブジェクト
 * @api private
 */
WSMessenger.prototype._notify = function(event, message, text) {
	this._listeners.forEach(function(listener) {
		if (listener.event == event) {
			listener.callback(message, text);
		}
	});
};


/* WebSocket拡張 */
/** JSON形式に変換して送信 */
WebSocket.prototype.sendJSON = function(message) {
	this.send(JSON.stringify(message));
};

})(window);
