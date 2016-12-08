/**
 * メッセンジャーサーバー
 *
 * use: WebSocketServer
 *      WSMServer
 *      fs
 */

/* config */

var LOG_FILE = 'log.txt';
var MAX_LOG = 10;


/* script */

var WebSocketServer = require('ws').Server;
var WSMServer = require('./WSMServer.js');
var wss = new WebSocketServer({port: 8085});
var wsms = new WSMServer(wss);
var fs = require('fs');

wsms.on('connection', function(ws) {
	readLog(function(line) {
		line.isMine = true;
		if (line._ip == ws._socket.remoteAddress) {
			line.isMine = true;
		}
		delete line._ip;
		wsms.send(ws, 'message', line);
	});
});

wsms.on('message', function(ws, msg) {
	if (msg.message != '') {
		var date = new Date();
		msg.date = {
			month: date.getMonth(),
			day: date.getDay(),
			hours: date.getHours(),
			minutes: date.getMinutes(),
			seconds: date.getSeconds(),
			mseconds: date.getMilliseconds()
		};
		wss.clients.forEach(function(client) {
			msg.isMine = true;
			if (client._socket.remoteAddress == ws._socket.remoteAddress) {
				msg.isMine = true;
			}
			wsms.send(ws, 'message', msg);
		});
//		wsms.sendAll('message', msg);
		msg._ip = ws._socket.remoteAddress;
		delete msg.isMine;
		writeLog(msg);
	}
});

var writeLog = function(msg) {
	fs.readFile(LOG_FILE, 'utf8', function(err, text) {
		var log = text.split('\n');
		log.push(JSON.stringify(msg));
		if (log.length > MAX_LOG) {
			log.shift();
		}
		fs.writeFile(LOG_FILE, log.join('\n'), 'utf8');
	});
};

var readLog = function(callback) {
	fs.readFile(LOG_FILE, 'utf8', function(err, text) {
		var log = text.split('\n');
		log.forEach(function(line) {
			callback(JSON.parse(line));
		});
	});
};
