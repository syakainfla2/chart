/*!
 * main script
 *
 * use: https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
 *      https://www.gstatic.com/charts/loader.js
 *      utility.js
 *      WSMessener.js
 *      php
 */

(function(global) {
'use strict';
console.log('load main script');

var result = {
	q1: [3, 5, 10, 13],
	q2: [4, 5, 5, 4, 3, ['aaa', 'bbb']],
	q3: [13, 12, 5, 10],
	q4: [
			['Tokyo', 30],
			['Kanagawa', 20],
			['Chiba', 10],
			['Yamaguchi', 2],
			['Shimane', 1]
		],
	q5: [10, 5, 4, 6, ['aaa', 'bbb']],
	q6: [10, 3, 5, 2, 6, 1],
	q7: [8, 5, 5, 6, ['ノージョブ', 'NEET']],
	q8: [6, 3, 9, 2, 6, 5, 3],
	q9: [9, 2],
	q10: [10, 5, 4, 6, ['aaa', 'bbb']],
};

window.addEventListener('load', function() {
/* htmlロード後 */

/* statics */
var body = $element('body');

/* chart */

// q1
var Q1 = new BarChart($element('#Q1'));
Q1.setHeader(['Game', '']);
Q1.setData([
	['してる', 0],
	['していない', 0]
]);
Q1.draw();

// q2
var Q2 = new ColumnChart($element('#Q2'));
Q2.setHeader(['機種', '']);
Q2.setData([
	['iPhone', 0],
	['Android', 0]
]);
Q2.draw();

// q3
var Q3 = new PieChart($element('#Q3'));
Q3.setHeader(['', '']);
Q3.setData([
	['ある', 0],
	['ない', 0],
	['迷い中', 0],
	['持ってる', 0]
]);
Q3.draw();

// q4
var Q4 = new GeoChart($element('#Q4'));
Q4.setHeader(['出身地', '人数']);
Q4.setData([
]);
Q4.draw();

// q5
var Q5 = new BarChart($element('#Q5'));
Q5.setHeader(['', '']);
Q5.setData([
	['ある', 0],
	['ない', 0]
]);
Q5.draw();

// q6
var Q6 = new PieChart($element('#Q6'));
Q6.setHeader(['', '']);
Q6.setData([
	['1年目', 0],
	['2年目', 0],
	['3年目', 0],
	['4年目', 0],
	['5年目~', 0],
	['常に楽しかった', 0]
]);
Q6.draw();

// q7
var Q7 = new BarChart($element('#Q7'));
Q7.setHeader(['', '']);
Q7.setData([
	['ノージョブ', 100]
]);
Q7.draw();

// q8
var Q8 = new PieChart($element('#q8'));
Q8.setHeader(['', '']);
Q8.setData([
	['睡眠', 0],
	['ゲーム', 0],
	['お出かけ', 0],
	['勉強', 0],
	['釣り', 0],
	['ドライブ', 0],
	['読書', 0]
]);
Q8.draw();

// q9
var Q9 = new One2OneChart($element('#Q9'));
Q9.setHeader(['', 'はい', 'いいえ']);
Q9.setData([['', 1, 1]]);
Q9.draw();

// q10
var Q10 = new BarChart($element('#Q10'));
Q10.setHeader(['', '']);
Q10.setData([
	['ない', 0]
]);
Q10.draw();


/* events */

btn_Q1.addEventListener('click', function() {
	Q1.setData([
		['パズドラ', 0],
		['モンスト', 0],
		['ポケモンGO', 0],
		['していない', 0]
	]);
	Q1.drawAnimation(result.q1);
});
btn_Q2.on('click', function() {
	Q2.setData([
		['iPhone5', 0],
		['iPhone6', 0],
		['iPhone7', 0],
		['Xperia', 0],
		['galaxy', 0],
		['その他', []]
	]);
	Q2.drawAnimation(result.q2);
});
btn_Q3.on('click', function() {
	Q3.drawAnimation(result.q3);
});
btn_Q4.on('click', function() {
	Q4.drawAnimation(result.q4);
});
btn_Q5.on('click', function() {
	Q5.setData([
		['タバコ', 0],
		['カラオケ', 0],
		['アニメ', 0],
		['サプリ', 0],
		['その他', []]
	]);
	Q5.drawAnimation(result.q5);
});
btn_Q6.on('click', function() {
	Q6.drawAnimation(result.q6);
});
btn_Q7.on('click', function() {
	Q7.setData([
		['学生', 0],
		['フリーター', 0],
		['パチプロ', 0],
		['プログラマ', 0],
		['その他', []]
	]);
	Q7.drawAnimation(result.q7);
});
btn_Q8.on('click', function() {
	Q8.drawAnimation(result.q8);
});
btn_Q9.on('click', function() {
	Q9.drawAnimation(result.q9);
});
btn_Q10.on('click', function() {
	Q10.setData([
		['ない', 0],
		['ニュース', 0],
		['ドラマ', 0],
		['アニメ', 0],
		['その他', []]
	]);
	Q10.drawAnimation(result.q10);
});

setTimeout(function() {

	var width = parseInt(d3.select('#background').style('width'));
	var height = parseInt(d3.select('#background').style('height'));
	var data = [30, 0];
	var radius = width / 2 * 2.0;
	var arc = d3.svg.arc().innerRadius(radius * 0.0).outerRadius(radius)
		.startAngle(0)//.endAngle((Math.PI * 2) * 0.3);
	var pie = d3.layout.pie().value(function(d){ return d; });
	var gradient = d3.scale.linear().domain([0, 100]).range(['white', 'gray']);

	var frame = d3.select('#background')//.selectAll(".bgarc")
//		.data(pie(data))
//		.enter()
		.append("g")
			.attr("transform", "translate(" + (width/2) + "," + (height/2) + ")")
			.attr("class", "bgarc");

	var arcs = frame.append("path")
		.datum({ endAngle: 0 })
		.attr("stroke", "none")
//		.attr("fill", function(d) { return gradient(d.data) })
		.attr("fill", '#a2e4f9')
		.attr("d", arc)
		.attr('opacity', 0.3)

	var animate = function(rate, option) {
		var arch = d3.svg.arc().innerRadius(radius * 0.0).outerRadius(radius)
			.startAngle(0);
		var opt = {}.merge(option || {});
		arcs.transition()
			.ease(opt.easing || 'circle-out')
			.duration(opt.duration || 500)
			.delay(opt.delay || 0)
			.attrTween("d", function(d) {
				var interpolate = d3.interpolate(d.endAngle, (Math.PI * -2) * rate);
				return function(t) {
					d.endAngle = interpolate(t);
					return arc(d);
				};
			})
	};

	var scroll = function(startX, startY, endX, endY) {
		var endPoint = body.scrollWidth - body.clientWidth - 100;
		var now = endX;
		animate(now / endPoint);
	};
	$(".scrollLink").each(function() {
		this.onstart = scroll;
	});
	scroll(0, 0, window.pageXOffset, 0);

}, 100);

}); // window.onload

})(window); // this file scope
