//
// jQuery Scrollable Anchor Plugin
//
//   http://webrocketsmagazine.com/
//


$(document).ready(function() {
	$(".scrollLink").scrollLink();
});

jQuery.fn.scrollLink = function() {
	return this.each(function(){
		var $anchr = $(this);
		var anchr = this;
		$anchr.click(function(e) {
			var x = window.pageXOffset;
			var y = window.pageYOffset;
			e.preventDefault();
			var targetId = $anchr.attr('href');
			var target;
			if (targetId == '#next') {
				target = findNext();
			} else if (targetId == '#prev') {
				target = findPrev();
			} else {
				target = $(target);
			}
			var speed = $anchr.data('speed') || 500;
			var easing = $anchr.data('easing');
			var callback = anchr.onstart;

			var top = target.length > 0 ? target.offset().top : 0;
			var left = target.length > 0 ? target.offset().left : 0;
			$("html:not(:animated),body:not(:animated)")
				.stop()
				.animate({ scrollTop: top, scrollLeft: left }, speed, easing, function() {
					var id = target.attr('id');
					if (id != null && id != undefined && id != '') {
						window.location.hash = target.attr('id');
					}
				});
			callback(x, y, left, top);
		  	return false;
		})
	})
}

function findNext() {
	var x = window.pageXOffset;
	var y = window.pageYOffset;
	var next = $(".scrollTarget:first");
	$(".scrollTarget").each(function(i, elem) {
		var diffX = $(elem).offset().left - x;
		var diffY = $(elem).offset().top - y;
		if (diffX >= 1 || diffY >= 1) {
			next = $(elem);
			return false;
		}
	});
	return next;
}

function findPrev() {
	var x = window.pageXOffset;
	var y = window.pageYOffset;
	var prev = $(".scrollTarget:last");
	$(".scrollTarget").each(function(i, elem) {
		var diffX = x - $(elem).offset().left;
		var diffY = y - $(elem).offset().top;
		if (diffX >= 1 || diffY >= 1) {
			prev = $(elem);
		} else {
			return false;
		}
	});
	return prev;
}
