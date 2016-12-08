/*!
 * WSMServer: WebSocketServerのイベント送受信抽象化クラス
 * websocket系ユーティリティライブラリ
 */

(function(global) {
'use strict'

var WebSocketServer = require('ws').Server;
var WebSocket = require('ws');

/**
 * コンストラクタ
 * @constructor
 + @param {WebSocketServer} wss serverインスタンス
 */
global.WSMServer = function(wss) {
	this._wss = wss;           //!< WebSocketServer
	this._listeners = Array(); //!< リスナ
	this._binary_text = [];

	/* リスナ登録 */
	var my = this;
	this._wss.on('connection', function(ws) {
		my._notify(ws, 'connection');
		ws.on('message', function(message, flags) {
			if (flags.binary) {
				// textのackきてからnotify
				var ack = my.on('ack_binary_text', function(soc, text) {
					if (text.ack == ack) {
						my.off(ack);
						my._notify(ws, 'binary', message, text);
					}
				});
				// textをrequest
				ws.sendJSON({ event: 'req_binary_text', data: { ack: ack } });
			} else {
				var msg = JSON.parse(message);
				my._notify(ws, msg.event, msg.data);
			}
		});
		ws.on('close', function() {
			my._notify(ws, 'close');
		});
	});

	// binaryのtext要求きたら、ペンディング中のテキストメッセージを送信
	this.on('req_binary_text', function(ws, msg) {
		var data = my._binary_text[0];
		data.ack = msg.ack;
		ws.sendJSON({ event: 'ack_binary_text', data: my._binary_text[0] });
		my._binary_text.shift();
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
WSMServer.prototype.on = function(event, callback) {
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
WSMServer.prototype.off = function(id) {
	var my = this;
	this._listeners.forEach(function(listener, i) {
		if (listener.id == id) {
			my._listeners.splice(i, 1);
		}
	});
};

/**
 * メッセージ送信
 * @param {WebSocket} ws 送信先WebSocket
 * @param {String} event イベント種別
 * @param {Object} message メッセージオブジェクト
 * @api public
 */
WSMServer.prototype.send = function(ws, event, message, text) {
	if (event == 'binary') {
		ws.send(message);
		this._binary_text.push(text);
	} else {
		ws.sendJSON({ event: event, data: message });
	}
};

/**
 * 全クライアントへのメッセージ送信 (サーバー専用)
 * @param {String} event イベント種別
 * @param {Object} message メッセージオブジェクト
 * @api public
 */
WSMServer.prototype.sendAll = function(event, message, text) {
	var my = this;
	this._wss.clients.forEach(function(client) {
		if (event == 'binary') {
			client.send(message, { binary: true });
			my._binary_text.push(text);
		} else {
			client.sendJSON({ event: event, data: message });
		}
	});
};

/**
 * イベント通知
 * @param {WebSocket} ws イベント送信元WebSocket
 * @param {String} event イベント種別
 * @param {Object} message メッセージオブジェクト
 * @api private
 */
WSMServer.prototype._notify = function(ws, event, message, text) {
	this._listeners.forEach(function(listener) {
		if (listener.event == event) {
			listener.callback(ws, message, text);
		}
	});
};

/**
 * クライアントのソケットを取得
 * @param {String} ip クライアントのIP
 * @api public
 */
WSMServer.prototype.socket = function(ip) {
	var my = this;
	var ret;
	my._wss.clients.forEach(function(ws){
		if(ws._socket.remoteAddress == ip) {
			ret = ws;
			return false;
		}
	});
};


/* WebSocket拡張 */
/** JSON形式に変換して送信 */
WebSocket.prototype.sendJSON = function(message) {
	this.send(JSON.stringify(message));
};

/** socketのセキュリティキー取得 */
WebSocket.prototype.getId = function() {
	return this.upgradeReq.headers['sec-websocket-key'];
};


module.exports = WSMServer;

})(global);
