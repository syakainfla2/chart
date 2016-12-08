/*!
 * main script
 *
 * use: https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js
 *      https://www.gstatic.com/charts/loader.js
 *      utility.js
 *      WSMessener.js
 *      php
 */

(function(global) { // this file scope
'use strict';
console.log('load main script');

var log = [];
/*
<?php
include_once("./pLib/utility.php");
include_once("./pLib/FileHandler.php");
$log = new FileHandler("./log.txt");
$result = $log->read();
foreach ($result as $res) {
	print("log.push(".$res.");");
}
?>
var result = {
	q1: [0, 0],
	q2: [0, 0, 0, 0, 0],
	q3: [0, 0, 0, 0, 0, []],
	q4: [0, 0, 0, 0, 0],
	q5: []
};
log.forEach(function(res) {
	Object.keys(res).forEach(function(q){
		if (typeof res[q] === 'object') {
			// オブジェクトの場合はそのまま追加
			result[q].push(res[q]);
		}
		else if (/^\d+$/.test(res[q])) {
			// 数字の場合は該当番地の要素を加算
			var i = parseInt(res[q]) - 1;
			result[q][i]++;
		} else {
			// 文字列の場合は「その他」として末尾要素の配列に追加
			result[q].last().push(res[q]);
		}
	});
});
*/
var result = {
	q1: [3, 2],
	q2: [5, 2, 1, 7, 4],
	q3: [3, 4, 6, 2, 1, []],
	q4: [6, 4, 2, 1, 8],
	q5: [
		[10, 50],
		[13, 55],
		[30, 60]
	]
};

window.addEventListener('load', function() {
/* htmlロード後 */

/* statics */
var body = $element('body');

/* chart */

// q1
var one2onechart = new One2OneChart($element('#One2OneChart'));
one2onechart.setHeader(['Genre', 'Fantasy & Sci Fi', 'Romance']);
one2onechart.setData([['', 1, 1]]);
one2onechart.draw();

// q2
var piechart = new PieChart($element('#PieChart'));
piechart.setHeader(['Task', 'Hours per Day']);
piechart.setData([
	['Work',     0],
	['Eat',      0],
	['Commute',  0],
	['Watch TV', 0],
	['Sleep',    0]
]);
piechart.draw();

// q3
var barchart = new BarChart($element('#BarChart'));
barchart.setHeader(['Task', 'Hours per Day']);
barchart.setData([
	['Work',     0],
	['Eat',      0],
	['Commute',  0],
	['Watch TV', 0],
	['Sleep',    0],
	['else',     0]
]);
barchart.draw();

// q4
var columnchart = new ColumnChart($element('#ColumnChart'));
columnchart.setHeader(['Task', 'Hours per Day', { role: 'style' }]);
columnchart.setData([
	['Work',     0, '#3bbb5f'],
	['Eat',      0, '#8ab0f0'],
	['Commute',  0, '#ebb474'],
	['Watch TV', 0, '#eba8e9'],
	['Sleep',    0, '#bbd276']
]);
columnchart.draw();

// q5
var scatterchart = new ScatterChart($element('#ScatterChart'));
scatterchart.setHeader(['Age', 'Weight']);
scatterchart.setData([[0, 0]]);
scatterchart.draw();

// q6
var ggeochart = new GGeoChart($element('#GGeoChart'));
ggeochart.setHeader(['City', 'Population']);
ggeochart.setData([
	['Tokyo', 0],
	['Kanagawa', 0]
]);
ggeochart.draw();

// q7
var geochart = new GeoChart($element('#GeoChart'));
geochart.setHeader(['City', 'Population']);
geochart.setData([
]);
geochart.draw();


/* events */

btn_One2One.addEventListener('click', function() {
	one2onechart.drawAnimation(result.q1);
});
btn_Pie.on('click', function() {
	piechart.drawAnimation(result.q2);
});
btn_Bar.on('click', function() {
	barchart.drawAnimation(result.q3);
});
btn_Column.on('click', function() {
	columnchart.drawAnimation(result.q4);
});
btn_Scatter.on('click', function() {
	// intにする
	result.q5.forEach(function(rows, i) {
		rows.forEach(function(cols, j) {
			result.q5[i][j] = parseInt(cols, 10);
		});
	});
	scatterchart.drawAnimation(result.q5);
});
btn_GGeo.on('click', function() {
	ggeochart.drawAnimation([
		['Tokyo', 1000],
		['Kanagawa', 3000]
	]);
});
btn_Geo.on('click', function() {
	geochart.drawAnimation([
		['Tokyo', 30],
		['Kanagawa', 20],
		['Chiba', 10],
		['Yamaguchi', 2],
		['Shimane', 1]
	]);
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
