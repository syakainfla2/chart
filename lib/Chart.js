/*!
 * Chart: グラフを操作するクラス
 *   google.chart汎用化ライブラリ
 *
 * need: https://www.gstatic.com/charts/loader.js
 *       utility.js
 */

(function(factory) {
'use strict'

/* load google chart */
google.charts.load('current', { packages: ['corechart', 'geochart'] });
//google.charts.load('upcoming', { packages: ['geochart']});

/**
 * gc: google.charts読み込み同期マネージャ
 */
var gc = {
	isReady: false,
	stacked_tasks: Array()
};

/**
 * 読み込み完了後に実行
 * 読み込み完了してたら即実行
 * @api private
 */
gc.onReady = function(task) {
	if (gc.isReady == true) {
		task();
		return;
	}
	gc.stacked_tasks.push(task);
};

/**
 * 読み込み完了通知
 * @api private
 */
gc.ready = function() {
	gc.stacked_tasks.forEach(function(task) {
		task();
	});
	gc.isReady = true;
};

google.charts.setOnLoadCallback(gc.ready);

/**
 * コンストラクタ
 * @constructor
 * @param {String} type グラフ種別
 * @param {Object} parent 親DOM要素 (挿入先)
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var Chart = function(type, parent, option, style) {
	this.parent = parent;
	this.option = {
		animation: {},
		fontSize: 20,
		tooltip: { ignoreBounds: true },
		hAxis: { gridlines: { count: 5 } },
		vAxis: { gridlines: { count: 5 } },
		backgroundColor: { fill: 'none' }
	};
	this.option.merge(option);
	this._listeners = Array();
	this.element = document.createElement('div');
	this.animation = new Animation(this);
	this.table = {
		header: [],
		data: []
	};
	this.element.style.merge({ width: '100%', height: '100%' }).merge(style);
	if (parent != null) {
		parent.appendChild(this.element);
	}
	var my = this;
	gc.onReady(function() {
		my.chart = new google.visualization[type](my.element);
	});
};
factory.Chart = Chart;

/**
 * グラフの設定
 * @param {Object} option 設定
 */
Chart.prototype.setOption = function(option) {
	this.option.merge(option);
};

/**
 * テーブルヘッダの設定
 * @param {Array} header タイトル
 */
Chart.prototype.setHeader = function(header) {
	this.table.header = header.concat();
};

/**
 * テーブルデータの設定
 * @param {Array|Number} args[0] テーブルデータ|column
 * @param {Array|Number|undefined} args[1] テーブルデータ | row | 指定なし
 * @param {Array|undefined} args[2] テーブルデータ | 指定なし
 */
Chart.prototype.setData = function() {
	var args = Array.apply(null, arguments);
	switch (args.length) {
		case 1:
			this.table.data = args[0].slice();
			break;
		case 2:
			this.table.data.assign(args[0] + 1, []);
			this.table.data[args[0]] = args[1].slice();
			break;
		case 3:
			this.table.data.assign(args[0] + 1, []);
			this.table.data[args[0]].assign(args[1] + 1, null);
			this.table.data[args[0]][args[1]] = args[2];
			break;
	}
};

/**
 * 表示/データを変更
 * @param {Array} table データテーブル
 * @param {Object} option グラフの設定
 */
Chart.prototype.draw = function(table, option) {
	var my = this;
	var opt = {}.merge(my.option).merge(option);
	gc.onReady(function() {
		if (typeof table === 'object') {
			my.data = google.visualization.arrayToDataTable(table);
		} else {
			var data = my.table.data.slice();
			data.forEach(function(d) {
				d.assign(my.table.header.length, 0);
			});
			data.unshift(my.table.header);
			my.data = google.visualization.arrayToDataTable(data);
		}
		my.chart.draw(my.data, opt);
	});
};

/**
 * イベントリスナ登録
 * @param {String} event イベント種別
 * @param {Function} listener 登録するリスナ
 * @param {Function} callback コールバック
 * @api public
 */
Chart.prototype.addListener = function(event, listener, callback) {
	var my = this;
	var isFinish = false;
	var ret;
	gc.onReady(function() {
		ret = google.visualization.events.addListener(my.chart, event, listener);
		if (typeof callback === 'function') { callback(ret); }
	});
};

/**
 * 1度だけ呼ばれるイベントリスナ登録
 * @param {String} event イベント種別
 * @param {Function} listener 登録するリスナ
 * @param {Function} callback コールバック
 * @api public
 */
Chart.prototype.addOneTimeListener = function(event, listener, callback) {
	var my = this;
	var ret;
	gc.onReady(function() {
		ret = google.visualization.events.addOneTimeListener(my.chart, event, listener);
		if (typeof callback === 'function') { callback(ret); }
	});
};

/**
 * イベントリスナ削除
 * @param {Object} handler イベントハンドラ
 * @api public
 */
Chart.prototype.removeListener = function(handler) {
	gc.onReady(function() {
		google.visualization.events.removeListener(handler);
	});
};

/**
 * イベントリスナ全削除
 * @api public
 */
Chart.prototype.removeAllListeners = function() {
	var my = this;
	gc.onReady(function() {
		google.visualization.events.removeAllListeners(my.chart);
	});
};


/**
 * アニメーション制御ハンドル
 * @param {Chart} target アニメ対象グラフ
 */
var Animation = function(target) {
	this.target = target;
	this.frame = [];
};

/**
 * アニメのフレーム設定
 * @param {Array} frame フレーム
 */
Animation.prototype.setFrame = function(frame) {
	this.frame = frame.slice();
};

/**
 * アニメ再生
 * @param {Function} callback コールバック
 */
Animation.prototype.play = function(callback) {
	var my = this;
	var chart = my.target;

	// grid消す
	var option = { animation: { duration: 500 } }.merge(chart.option);
	chart.setOption({
		animation: { duration: 0 },
		hAxis: { gridlines: { count: 0 } },
		vAxis: { gridlines: { count: 0 } }
	});
	chart.draw();

	var count = 0;
	function loop() {
		if (count < my.frame.length) {
			// アニメ中の処理
			chart.addOneTimeListener('animationfinish', loop);
			chart.option.merge(my.frame[count].option || {});
			chart.option.animation.merge(my.frame[count].animation || {});
			chart.setData(my.frame[count].data);
			chart.draw();
			count++;
		} else {
			// アニメ終了時の処理
			chart.setOption(option);
			chart.draw();
			if (typeof callback === 'function') callback();
		}
	}
	gc.onReady(loop);
};

/**
 * 1:1のグラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var One2OneChart = function(parent, option, style) {
	factory.Chart.call(this, 'BarChart', parent, {}, style);
	this.option.merge({
		isStacked: 'percent',
		legend: { position: 'top', maxLines: 3 },
		hAxis: {
			minValue: 0,
			ticks: [
				{ v: 0.0, f: '0%' },
				{ v: 0.5, f: '50%' },
				{ v: 1.0, f: '0%' }
			]
		},
		animation: {
			startup: false,
			duration: 1000,
			easing: 'out'
		}
	}).merge(option);
};
One2OneChart.prototype = Object.create(Chart.prototype);
One2OneChart.prototype.constructor = Chart;
factory.One2OneChart = One2OneChart;

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Number} l 左側の値
 * @param {Number} r 右側の値
 */
One2OneChart.prototype.drawAnimation = function() {
	var l, r;
	var args = Array.apply(null, arguments);
	if (args[0] instanceof Array) {
		l = args[0][0];
		r = args[0][1];
	} else {
		l = args[0];
		r = args[1];
	}
	var row = this.table.data[0][0] || '';
	var data = [];
	for (var i = 0; i < 3; i++) {
		var randA = Math.floor(Math.random() * 101);
		var randB = Math.floor(Math.random() * 101);
		data.push([row, randA, randB]);
	}
	this.animation.setFrame([
		{ data: [data[0]], animation: { duration: 500, easing: 'linear' } },
		{ data: [data[1]], animation: { duration: 500, easing: 'linear' } },
		{ data: [data[2]], animation: { duration: 500, easing: 'linear' } },
		{ data: [[row, l, r]], animation: { duration: 1000, easing: 'end' } }
	]);
	this.animation.play();
};

/**
 * 円グラフ
 * @param {Object} parent 親要素
 * @param {Object} style スタイル
 * @param {Object} option グラフの設定
 */
var GPieChart = function(parent, option, style) {
	factory.Chart.call(this, 'PieChart', parent, option, style);
	this.option.merge({
	});
	this.option.merge(option);
};
GPieChart.prototype = Object.create(Chart.prototype);
GPieChart.prototype.constructor = Chart;
factory.GPieChart = GPieChart;

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} args データ
 */
GPieChart.prototype.drawAnimation = function() {
	var args = Array.apply(null, arguments);
	var data1 = this.table.data.slice();
	var data2 = this.table.data.slice();
	data1[0][1] = 1;
	for (var i = 0; i < args.length; i++) {
		data2[i][1] = args[i];
	}
	var animation1 = { duration: 500, easing: 'linear' };
	var animation2 = { duration: 1000, easing: 'end' };

	var option1 = { pieHole: 0.1 };
	var option2 = { pieHole: 0.5 };

	this.animation.setFrame([
		{ data: data1, animation: animation1, option: option1 },
		{ data: data2, animation: animation2, option: option2 }
	]);
	this.animation.play();
};

/**
 * 円グラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var PieChart = function(parent, option, style) {
	this.option = {
		fontSize: 20,
		colors: [
			'#e2431e', '#e7711b', '#f1ca3a',
		    '#6f9654', '#1c91c0', '#43459d',
			'#c1f598', '#74bde0', '#e38a8a'
		],
		slices: [],
		animation: {}
	}.merge(option);
	this.table = {
		header: [],
		data: []
	};
	this.element = $create('div');
	this.element.style.merge({ minWidth: '100%', height: '100%' }).merge(style);
	if (parent != null) {
		parent.appendChild(this.element);
	}
	this.chart = d3.select(this.element).append('svg');
};
factory.PieChart = PieChart;

/**
 * グラフの設定
 * @param {Object} option 設定
 */
PieChart.prototype.setOption = function(option) {
	Chart.prototype.setOption.apply(this, arguments);
};

/**
 * テーブルヘッダの設定
 * @param {Array} header タイトル
 */
PieChart.prototype.setHeader = function(header) {
	Chart.prototype.setHeader.apply(this, arguments);
};

/**
 * テーブルデータの設定
 * @param {Array|Number} args[0] テーブルデータ|column
 * @param {Array|Number|undefined} args[1] テーブルデータ | row | 指定なし
 * @param {Array|undefined} args[2] テーブルデータ | 指定なし
 */
PieChart.prototype.setData = function() {
	Chart.prototype.setData.apply(this, arguments);
};

/**
 * 表示/データを変更
 * @param {Array} table データテーブル
 * @param {Object} option グラフの設定
 * @param {Boolean} isAnimate アニメ有無
 */
PieChart.prototype.draw = function(table, option, isAnimate, callback) {
	var my = this;
	var opt = {}.merge(this.option).merge(option);
	var data = this.table.data.slice();
	data.unshift(this.table.header);
	if (table !== null && table !== undefined) {
		data = table.slice();
	}

	this.data = [];
	data.shift();
	data.forEach(function(d, i) {
		my.data.push({ name: d[0], val: d[1], color: d[2] || my.option.colors[i] });
	});

	var width = parseInt(d3.select(this.element).style('width'));
	var height = parseInt(d3.select(this.element).style('height'));
	this.chart.remove();
	this.chart = d3.select(this.element).append('svg');
	this.chart.attr('width', width).attr('height', height);

	/* タイトル作成 */
	var titleY = 35.5;
	var renderY = titleY;
	var title;
	if (typeof opt.title === 'string' && opt.title != '') {
		title = createTitle(this.chart, width / 2, titleY, opt);
		renderY += opt.fontSize;
	}

	/* 円弧の親を作成 */
	var circleY = renderY;
	var circleSize = width < (height - circleY) ? width : (height - circleY);
	var center = { x: width / 2, y: circleSize / 2 + circleY };
	var circles = createArcFrames(this.chart, center, this.data);

	/* 円弧の作成 */
	var padding = 0;
	var radius = (circleSize / 2) - padding;
	var listX = width / 2 + radius + 10;
	var arcs = createArcs(circles, radius, isAnimate, opt, function() {
		createList(my.chart, listX, renderY, circleSize / 10, my.data, opt);
		if (typeof callback === 'function') callback();
	});
	if (isAnimate == false) {
		createList(this.chart, listX, renderY, circleSize / 10, data, opt);
	}
	/* ポップアップを作成 */
	createPopup(this.chart, center, radius, this.data, opt);
};

/** タイトルの作成 */
function createTitle(parent, x, y, option) {
	return parent.append('g')
		.append('text')
			.text(option.title || '')
			.attr('dx', x)
			.attr('dy', y)
			.attr('font-size', option.fontSize)
			.attr('text-anchor', 'middle')
			.attr('font-family', option.fontFamily || 'Arial')
			.attr('font-weight', option.fontWeight || 'bold')
			.attr('fill', option.fontColor || '#000000');
}

/** リストの作成 */
function createList(parent, x, y, lineHeight, data, option) {
	var pie = d3.layout.pie().value(function(d){ return d.val; });
	var gradient = d3.scale.linear().domain([0, 10]).range(['yellow', 'red']);
	var frame = parent.append("g");
	var h = lineHeight;
	var r = h/2 - 3;
	var fontsize = h/2;

	var list = frame.selectAll(".list")
		.data(pie(data))
		.enter()
		.append("g")
			.attr("class", ".list");

	list.append("circle")
		.attr("cx", x + r)
		.attr("cy", function (d, i) { return i * h + y; })
		.attr("r", r)
		.attr("fill", function(d) { return d.data.color || gradient(d.data.val) });

	list.append("text")
		.text(function(d) { return d.data.name; })
		.attr('x', x + r * 2 + 3)
		.attr('y', function (d, i) { return i * h + y + (fontsize/3); })
		.attr('font-size', fontsize)
		.attr('text-anchor', 'start')
		.attr('font-family', option.fontFamily || 'Arial')
		.attr('font-weight', option.fontWeight || 'bold')
		.attr('fill', option.fontColor || '#000000');

//	frame.style("opacity", 0);
}

/** 円弧の親の作成 */
function createArcFrames(parent, center, data) {
	var pie = d3.layout.pie().value(function(d){ return d.val; });
	return parent.selectAll(".arc")
		.data(pie(data))
		.enter()
		.append("g")
			.attr("transform", "translate(" + center.x + "," + center.y + ")")
			.attr("class", "arc");
}

/* 円弧の作成 */
function createArcs(parent, radius, isAnimate, option, callback) {
    var arc = d3.svg.arc().innerRadius(radius * (option.pieHole || 0)).outerRadius(radius);
	var gradient = d3.scale.linear().domain([0, 10]).range(['yellow', 'red']);
	var arcs = parent.append("path")
		.attr("stroke", "white")
		.attr("fill", function(d) { return d.data.color || gradient(d.data.val) });

	arcs.on('mouseover', function(d) {
		d3.selectAll("." + 'arc' + encodeURIComponent(d.data.name).replace(/[%~]/g, ''))
			.style("display", "block");
	});
	arcs.on('mouseout', function(d) {
		d3.selectAll("." + 'arc' + encodeURIComponent(d.data.name).replace(/[%~]/g, ''))
			.style("display", "none");
	});

	if (isAnimate === true) {
		/* アニメ */
		var count = 0;
		arcs.transition()
			.ease(option.animation.easing || 'circle-in-out')
			.delay(option.animation.delay || 0)
			.duration(option.animation.duration || 2000)
			.attrTween("d", function(d) {
				var interpolate = d3.interpolate(
					{ startAngle: 0, endAngle: 0 },
					{ startAngle: d.startAngle, endAngle: d.endAngle }
				);
				return function(t) {
					return arc(interpolate(t));
				};
			})
			.each("end", function() {
				count++;
				if (count == arcs.size() && typeof callback === 'function') {
					callback();
				}
			});
	} else {
		arcs.attr("d", arc);
	}
	return arcs;
}

/** ポップアップ作成 */
function createPopup(parent, center, radius, data, option) {
    var arc = d3.svg.arc().innerRadius(radius * 0.6).outerRadius(radius * 1.1);
	var pie = d3.layout.pie().value(function(d){ return d.val; });
	var fontSize = option.fontSize || 20;
	var padding = 3;
	var height = (fontSize + padding) * 2 + padding;
	var popup = parent.selectAll(".popup")
		.data(pie(data))
		.enter()
		.append("g")
			.style("display", "none")
			.attr("class", function(d) { return 'arc' + encodeURIComponent(d.data.name).replace(/[%~]/g, ''); });

	popup.on('mouseover', function(d) {
		d3.selectAll("." + 'arc' + encodeURIComponent(d.data.name).replace(/[%~]/g, ''))
			.style("display", "block");
	});
	popup.on('mouseout', function(d) {
		d3.selectAll("." + 'arc' + encodeURIComponent(d.data.name).replace(/[%~]/g, ''))
			.style("display", "none");
	});

	// 背景
	var rect = popup.append("rect")
		.attr("dx", 0)
		.attr("dy", 0)
		.attr("fill", "white")
		.attr("height", height)
		.attr('stroke-width', 1)
		.attr('stroke', '#cccccc');

	var text = popup.append("g");
	// 1行目
	var line1 = text.append("text")
		.attr("dx", padding)
		.attr("dy", padding)
		.attr("font-size", fontSize)
		.attr('font-family', option.fontFamily || 'Arial')
		.style("text-anchor", "start")
		.style("dominant-baseline", "text-before-edge")
		.text(function(d){ return d.data.name; });
	// 2行目
	var line2 = text.append("text")
		.attr("dx", padding)
		.attr("dy", fontSize + padding)
		.attr("z", 11)
		.attr("font-size", fontSize)
		.attr('font-family', option.fontFamily || 'Arial')
		.attr('font-weight', 'bold')
		.style("text-anchor", "start")
		.style("dominant-baseline", "text-before-edge")
		.text(function(d){
			var pacentage = (((d.endAngle - d.startAngle) / (Math.PI * 2)) * 100).float(2);
			return d.data.val + ' (' + pacentage + '%)'; })

	// 横幅の調整
	var widths = [];
	rect.attr('width', function(d, i) {
		var length1 = line1[0][i].textContent.length;
		var length2 = line2[0][i].textContent.length;
		var length = length1 > length2 ? length1 : length2;
		var width = length * fontSize * 0.7;
		widths.push(width)
		return width;
	});
	popup.attr("transform", function(d, i){
		var arccenter = arc.centroid(d);
		var x = arccenter[0] - (widths[i] / 2) + center.x;
		var y = arccenter[1] - (height / 2) + center.y;
		return "translate(" + x + "," + y +")";
	});
}

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} args データ
 */
PieChart.prototype.drawAnimation = function() {
	var args = Array.apply(null, arguments);
	if (args[0] instanceof Array) {
		args = args[0];
	}
	var my = this;
	args.forEach(function(val, i) {
		my.table.data.assign(i+1, []);
		my.table.data[i].assign(2, null);
		my.table.data[i][1] = val;
	});
	this.draw(null, null, true);
};


/**
 * 横の棒グラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var BarChart = function(parent, option, style) {
	factory.Chart.call(this, 'BarChart', parent, {}, style);
	this.option.merge({
		animation: {
			startup: false,
			duration: 1000,
			easing: 'out'
		},
		isStacked: true,
        bar: { groupWidth: "90%" },
		legend: { position: "none" }
	}).merge(option);
};
BarChart.prototype = Object.create(Chart.prototype);
BarChart.prototype.constructor = Chart;
factory.BarChart = BarChart;

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} args データ
 */
BarChart.prototype.drawAnimation = function() {
	var args = Array.apply(null, arguments);
	if (args[0] instanceof Array) {
		args = args[0];
	}
	var my = this;
	var datas = [];
	var dataIndex = 1;
	for (var i = 0; i < 3; i++) {
		var data = [];
		args.forEach(function(val, i) {
			var row = my.table.data[i].slice();
			var rand = Math.floor(Math.random() * 101);
			row[dataIndex] = rand;
			data.push(row);
		});
		datas.push(data);
	}
	var data = [];
	args.forEach(function(val, i) {
		var row = my.table.data[i].slice();
		if (val instanceof Array) {
			var column = [];
			// 配列の場合、データを分割する
			val.forEach(function(v) {
				var col = column.search({ name: v });
				if (col != null) {
					// 既に追加されたカラムの場合、加算
					col.value++;
				} else {
					// 新規カラム追加
					column.push({ name: v, value: 1 });
				}
			});
			// データ領域を広げる
			my.table.data.forEach(function(d) {
				d.assign(dataIndex + column.length + 1, 0);
			});
			// 取得したカラムをデータに反映する
			dataIndex++; // データの位置を右に1個ずらす
			column.forEach(function(c, i) {
				// ヘッダにカラムを追加
				my.table.header.assign(i+dataIndex+1, 0);
				my.table.header[i+dataIndex] = c.name;
				// データを追加
				row[i+dataIndex] = c.value;
			});
		} else {
			// カラム広げない通常はこっち
			row[dataIndex] = val;
		}
		data.push(row);
	});
	datas.push(data);
	this.animation.setFrame([
		{ data: datas[0], animation: { duration: 1000, easing: 'linear' } },
		{ data: datas[1], animation: { duration: 1000, easing: 'linear' } },
		{ data: datas[2], animation: { duration: 1000, easing: 'linear' } },
		{ data: datas[3], animation: { duration: 1500, easing: 'end' } }
	]);
	this.animation.play();
};


/**
 * 縦の棒グラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var ColumnChart = function(parent, option, style) {
	factory.Chart.call(this, 'ColumnChart', parent, {}, style);
	this.option.merge({
		animation: {
			startup: false,
			duration: 1000,
			easing: 'out'
		},
        bar: {groupWidth: "90%"},
		legend: { position: "none" },
		isStacked: true,
	}).merge(option);
};
ColumnChart.prototype = Object.create(Chart.prototype);
ColumnChart.prototype.constructor = Chart;
factory.ColumnChart = ColumnChart;

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} args データ
 */
ColumnChart.prototype.drawAnimation = function() {
	BarChart.prototype.drawAnimation.apply(this, arguments);
};

/**
 * ScatterChart
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var ScatterChart = function(parent, option, style) {
	factory.Chart.call(this, 'ScatterChart', parent, {}, style);
	this.option.merge({
		legend: 'none'
	}).merge(option);
};
ScatterChart.prototype = Object.create(Chart.prototype);
ScatterChart.prototype.constructor = Chart;
factory.ScatterChart = ScatterChart;

/**
 * 表示/データを変更
 * @param {Array} table データテーブル
 * @param {Object} option グラフの設定
 */
ScatterChart.prototype.draw = function(table, option) {
	var my = this;
	var opt = {}.merge(my.option).merge(option);
	opt.title = '';
	gc.onReady(function() {
		if (typeof table === 'object') {
			opt.merge({
				hAxis: { title: table[0][0] || '' },
				vAxis: { title: table[0][1] || '' }
			});
			my.data = google.visualization.arrayToDataTable(table);
		} else {
			opt.merge({
				hAxis: { title: my.table.header[0] || '' },
				vAxis: { title: my.table.header[1] || '' }
			});
			var data = my.table.data.slice();
			data.forEach(function(d) {
				d.assign(my.table.header.length, 0);
			});
			data.unshift(my.table.header);
			my.data = google.visualization.arrayToDataTable(data);
		}
		my.chart.draw(my.data, opt);
	});
};

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} data データ配列[x][2]
 */
ScatterChart.prototype.drawAnimation = function(data) {
	this.animation.setFrame([{
		data: data, animation: { duration: 1500, easing: 'end' }
	}]);
	this.animation.play();
};


/**
 * 地図グラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var GGeoChart = function(parent, option, style) {
	factory.Chart.call(this, 'GeoChart', parent, {}, style);
	this.option.merge({
        region: 'JP',
        colorAxis: { colors: ['#b6ffbb', 'green'] },
		datalessRegionColor: '#eeeeee',
		resolution: 'provinces',
	}).merge(option);
	this.element.style.merge({
		position: 'relative',
		top: '70%',
		left: '50%',
		width: '150%',
		height: '150%',
		transform: 'translate(-50%, -50%)'
	}).merge(style);
	this.parent.style.overflow = 'hidden';
};
GGeoChart.prototype = Object.create(Chart.prototype);
GGeoChart.prototype.constructor = Chart;
factory.GGeoChart = GGeoChart;

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} data データ配列[x][2]
 */
GGeoChart.prototype.drawAnimation = function(data) {
	this.animation.setFrame([{
		data: data, animation: { duration: 1500, easing: 'end' }
	}]);
	this.animation.play();
};


/**
 * 地図グラフ
 * @param {Object} parent 親要素
 * @param {Object} option グラフの設定
 * @param {Object} style スタイル
 */
var GeoChart = function(parent, option, style) {
	this.option = {
		datalessRegionColor: '#fff',
		datalessRegionAlpha: 0.6,
        colorAxis: { colors: ['#b6ffbb', 'green'] },
	}.merge(option);
	this.table = {
		header: [],
		data: []
	};
	this.element = $create('div', { draggable: true });
	this.element.style.merge({
		position: 'relative',
		minWidth: '100%',
		height: '100%',
		overflow: 'hidden'
	}).merge(style);
	if (parent != null) {
		parent.appendChild(this.element);
	}
	this.chart = d3.select(this.element).append('svg');
	this.mapdata = null;
	this._list = null;
	this._tooltip = null;
};
factory.GeoChart = GeoChart;

/**
 * グラフの設定
 * @param {Object} option 設定
 */
GeoChart.prototype.setOption = function() {
	Chart.prototype.setOption.apply(this, arguments);
};

/**
 * テーブルヘッダの設定
 * @param {Array} header タイトル
 */
GeoChart.prototype.setHeader = function() {
	Chart.prototype.setHeader.apply(this, arguments);
};

/**
 * テーブルデータの設定
 * @param {Array|Number} args[0] テーブルデータ|column
 * @param {Array|Number|undefined} args[1] テーブルデータ | row | 指定なし
 * @param {Array|undefined} args[2] テーブルデータ | 指定なし
 */
GeoChart.prototype.setData = function() {
	Chart.prototype.setData.apply(this, arguments);
};

/**
 * 表示/データを変更
 * @param {Array} table データテーブル
 * @param {Object} option グラフの設定
 * @param {Boolean} isAnimate アニメ有無
 */
GeoChart.prototype.draw = function(table, option, isAnimate, callback) {
	var my = this;
	var opt = {}.merge(this.option).merge(option);
	var data = this.table.data.slice();
	data.unshift(this.table.header);
	if (table !== null && table !== undefined) {
		data = table.slice();
	}

	this.data = [];
	data.shift();
	data.forEach(function(d, i) {
		my.data.push({ name: d[0], val: d[1] });
	});

	var width = parseInt(d3.select(this.element).style('width'));
	var height = parseInt(d3.select(this.element).style('height'));
	var margin = 500;

	if (my.mapdata == null) {
		this.chart.remove();
		this.chart = d3.select(this.element).append('svg');
		this.chart.style({
			position: 'absolute',
			top: -1 * margin,
			left: -1 * margin,
			width: width + margin * 2,
			height: height + margin * 2,
			transform: 'translateX(0)'
		});
		this.listboard = d3.select(this.element).append('svg');
		this.listboard.style({
			position: 'absolute',
			top: 0,
			left: 0,
			transform: 'translateX(0)'
		});
	}

	var drawOption = {
		defaultColor: opt.datalessRegionColor || '#fff',
		defaultAlpha: opt.datalessRegionAlpha || 0.7,
		colorScale: d3.scale.linear()
		    .range(opt.colorAxis.colors || [this.defaultColor, 'green'])
			.domain([
				d3.min(this.data, function (d) {
					return Number(d.val);
				}),
				d3.max(this.data, function (d) {
					return Number(d.val);
				})
			]),
		fontFamily: opt.fontFamily || 'Arial',
		fontColor: opt.fontColor || '#000'
	};

	// 投影法の指定
	var projectionOption = d3.geo.mercator()
		.center([137, 39])
		.scale(Math.min(width, height) * 2.9)
		.translate([(width + margin * 2)  / 2, (height + margin * 2)  / 2]);

	var projection = d3.geo.path().projection(projectionOption);

	if (my.mapdata == null) { // 初回描画時のみ
		// 地図作成
		d3.json('lib/res/japan.json', function(jpn) {
			my.mapdata = jpn.features;
			// 地図の作成
			my.map = my.chart.selectAll("path")
				.data(my.mapdata)
				.enter()
				.append('path')
				.attr({
					'stroke': '#333',
					'stroke-width': '0.5',
					'd': projection,
					'opacity': drawOption.defaultAlpha
				})
				.style("fill", drawOption.defaultColor)
				.on("mousemove", function (d, e) {
					var p = d3.mouse(my.element);
					my._showTooltip(p[0] - posX + 50, p[1] - posY + 0, d.properties);
				})
				.on('mouseover', function() {
					d3.select(this).attr('stroke', 'blue')
						.attr('stroke-width', '2.0');
				})
				.on("mouseout", function (d) {
					my._hideTooltip();
						d3.select(this).attr('stroke', '#333')
							.attr('stroke-width', '0.5');
				});
			// 地図を描画
			my._drawMap(my.data, drawOption, isAnimate, function() {
				// list作成
				my._createList(30, 30, height / 30, drawOption);
			});
			// tooltip作成
			my._createTooltip(height / 30, drawOption);

			// Dragで地図を移動する
			var posX = margin * -1;
			var posY = margin * -1;
			my.element.on('drag_ext', function(e) {
				posX -= e.movedX;
				posY -= e.movedY;
				my.chart.style({ top: posY, left: posX });
			});
		});
	} else {
		/* 2回目移行の描画はここだけ */
		my._drawMap(my.data, drawOption, isAnimate, function() {
			my._createList(30, 30, height / 30, drawOption);
		});
		my._createTooltip(height / 30, drawOption);
	}
};

/** 地図データにテーブルデータをinputする */
GeoChart.prototype._setMapData = function(data) {
	this.mapdata.forEach(function(jpndata) {
		var isHit = false;
		data.forEach(function(d) {
			if (d.name == jpndata.properties.name) {
				jpndata.properties.value = d.val;
				isHit = true;
				return false;
			}
		});
		if (isHit == false) {
			jpndata.properties.value = 0;
		}
	});
};

/** リスト作成 */
GeoChart.prototype._createList = function(x, y, fontSize, option) {
	var my = this;
	var h = fontSize * 1.8;
	var r = fontSize / 2;

	var listdata = my.data.slice();
	listdata.forEach(function(data) {
		data.name_local = my.mapdata.search({
			properties: { name: data.name } }).properties.name_local;
	});
	listdata.sort(function(a, b) {
		if (a.val > b.val) return -1;
		if (a.val < b.val) return 1;
		return 0;
	})

	if (this._list != null) this._list.remove();
	this._list = this.listboard.selectAll(".list")
		.data(listdata)
		.enter()
		.append("g")
			.attr("class", ".list");

	/* 円の追加 */
	this._list.append("circle")
		.attr("cx", x + r)
		.attr("cy", function (d, i) { return i * h + y; })
		.attr("r", r)
		.attr('fill', function (d) { return option.colorScale(d.val); });

	/* テキストの追加 */
	this._list.append("text")
		.text(function(d) { return d.name_local; })
		.attr('x', x + r * 2 + 3)
		.attr('y', function (d, i) { return i * h + y + (fontSize/3); })
		.attr('font-size', fontSize)
		.attr('text-anchor', 'start')
		.attr('font-family', option.fontFamily)
		.attr('font-weight', 'bold')
		.attr('fill', '#000');

	/* 値の追加 */
	this._list.append("text")
		.text(function(d) { return d.val; })
		.attr('x', (x + r * 2 + 3) + fontSize * 7)
		.attr('y', function (d, i) { return i * h + y + (fontSize/3); })
		.attr('font-size', fontSize)
		.attr('text-anchor', 'start')
		.attr('font-family', option.fontFamily)
		.attr('font-weight', 'bold')
		.attr('fill', '#000');
};

/** 地図データ反映 */
GeoChart.prototype._drawMap = function(data, option, isAnimate, callback) {
	var my = this;

	// 地図データにテーブルデータをinput
	this._setMapData(this.data);

	if (isAnimate) {
		this._drawMapAnimation(option, callback);
		return;
	}
	this.map.attr('opacity', function (d) {
		if (d.properties.value) {
			return 1.0;
		} else {
			return option.defaultAlpha;
		}
	})
	.style("fill", function (d) {
		var value = d.properties.value;
		if (value) {
			return option.colorScale(value);
		} else {
			return option.defaultColor;
		}
	});
	callback();
};

/** アニメーション */
GeoChart.prototype._drawMapAnimation = function(option, callback) {
	var my = this;
	var min = d3.min(this.mapdata, function (d) {
		return Number(d.properties.latitude);
	});
	var max = d3.max(this.mapdata, function (d) {
		return Number(d.properties.latitude);
	});
	var controlPoint = function(rate) {
		return min + (max - min) * rate;
	};
	var colorScale = d3.scale.linear()
		.range(this.option.colorAxis.colors || [option.defaultColor, 'green'])
		.domain([max - min, 0]);

	var finish = function() {
		var count = 0;
		my.map.transition().duration(1000).ease('linear').delay(0)
			.attr('opacity', function (d) {
				if (d.properties.value) {
					return 1.0;
				} else {
					return option.defaultAlpha;
				}
			})
			.style("fill", function (d) {
				var value = d.properties.value;
				if (value) {
					return option.colorScale(value);
				} else {
					return option.defaultColor;
				}
			})
			.each('end', function() {
				count++;
				if (count == my.map.size() && typeof callback === 'function') {
					callback();
				}
			});
	};

	var loop = function(rate) {
		var center = controlPoint(rate);
		var count = 0;
		my.map.transition().duration(50).ease('linear').delay(0)
			.style('fill', function(d) {
				return colorScale(Math.abs(center - d.properties.latitude));
			})
			.each('end', function() {
				count++;
				if (count == my.map.size()) {
					if (rate > 0.0) {
						loop(rate - 0.1);
					} else {
						finish();
					}
				}
			});
	};
	loop(1.9);
};

/** ツールチップ作成 */
GeoChart.prototype._createTooltip = function(fontSize, option) {
	var my = this;
	var padding = 3;
	var height = (fontSize + padding) * 2 + padding;

	if (this._tooltip != null) this._tooltip.remove();
	this._tooltip = this.chart.append("g")
		.style("display", "none")
		.attr("class", 'tooltip');

	this._tooltip.line = [];

	// 背景
	this._tooltip.rect = this._tooltip.append("rect")
		.attr("dx", 0)
		.attr("dy", 0)
		.attr("fill", "white")
		.attr("height", height)
		.attr('stroke-width', 1)
		.attr('stroke', '#cccccc');

	var text = this._tooltip.append("g");
	// 1行目
	var line1 = text.append("text")
		.attr("dx", padding)
		.attr("dy", padding)
		.attr("font-size", fontSize)
		.attr('font-family', option.fontFamily)
		.style("text-anchor", "start")
		.style("dominant-baseline", "text-before-edge")
	this._tooltip.line.push(line1);
	// 2行目
	var line2 = text.append("text")
		.attr("dx", padding)
		.attr("dy", fontSize + padding)
		.attr("z", 11)
		.attr("font-size", fontSize)
		.attr('font-family', option.fontFamily)
		.attr('font-weight', 'bold')
		.style("text-anchor", "start")
		.style("dominant-baseline", "text-before-edge")
	this._tooltip.line.push(line2);
};

/** ツールチップの表示 */
GeoChart.prototype._showTooltip = function(x, y, data) {
	// 0%、未定義は無視
	if (!(data.value > 0)) return;

	// 割合の算出
	var pacentage = ((data.value / this.data.sum('val')) * 100).float(2);
	var parcentStr = data.value + ' (' + pacentage + '%)';

	// テキスト反映
	this._tooltip.line[0].text(data.name_local);
	this._tooltip.line[1].text(parcentStr);

	// 横幅の調整
	var strlength = Math.max(data.name_local.length * 2, parcentStr.length);
	var width = strlength * this._tooltip.line[0].attr('font-size') * 0.7;
	this._tooltip.rect.attr('width', width);

	// 位置の調整/表示
	this._tooltip.attr('transform', 'translate(' + x + ',' + y +')')
		.style('display', 'block');
}
/** ツールチップの非表示 */
GeoChart.prototype._hideTooltip = function() {
	this._tooltip.style('display', 'none');
}

/**
 * アニメして値変更 (プリセットアニメーション)
 * @param {Array} args データ
 */
GeoChart.prototype.drawAnimation = function() {
	var args = Array.apply(null, arguments);
	var my = this;
	if (args.length == 1) {
		this.table.data = args[0];
	} else {
		this.table.data = [];
		args.forEach(function(data) {
			my.table.data.push(data);
		});
	}
	this.draw(null, null, true);
}


})(window); // this file scope
