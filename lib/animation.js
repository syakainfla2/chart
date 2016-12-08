/*!
 * animation
 *   アニメ
 *
 * need: https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
 *       http://ajax.googleapis.com/ajax/libs/jqueryui/1/jquery-ui.min.js
 *       utility.js
 */

(function(factory) {
'use strict';

/*
 * Node prototypes
 ----------------------------------------------- */

/** アニメの設定 */
Node.prototype.setAnimation = function(show, hide) {
	this.showAnimation = show;
	this.hideAnimation = hide || show;
};
Node.prototype.setPrependAnimation = function(prepend, remove) {
	this.prependAnimation = prepend;
	this.prependRemoveAnimation = remove || prepend;
};

/** 表示アニメ開始*/
Node.prototype.showAnimate = function(callback) {
	if (!(this.showAnimation instanceof Animation)) return;
	this.showAnimation.show(this, callback);
};

/** 消去アニメ開始 */
Node.prototype.hideAnimate = function(callback) {
	if (!(this.hideAnimation instanceof Animation)) return;
	this.hideAnimation.hide(this, callback);
};

/** 表示/消去アニメ開始 */
Node.prototype.toggleAnimate = function(showCallback, hideCallback) {
	var showCallback = showCallback || function(){};
	var hideCallback = hideCallback || function(){};
	if (this.style.display == 'none') {
		this.showAnimate(showCallback);
	} else {
		this.hideAnimate(hideCallback);
	}
};

/** prependアニメ開始*/
Node.prototype.prependAnimate = function(child, callback) {
	if (!(this.prependAnimation instanceof Animation)) return;
	this.prependAnimation.prepend(this, child, callback);
};

/** prepend:removeアニメ開始 */
Node.prototype.prependRemoveAnimate = function(child, callback) {
	if (!(this.prependRemoveAnimation instanceof Animation)) return;
	this.prependRemoveAnimation.remove(child, callback);
};


/*
 * ANM types
 ----------------------------------------------- */
var ANM = {};
factory.ANM = ANM;

ANM.DropDown = function(duration, easing, delay) {
	return new DropDown(duration, easing, delay);
};
ANM.SlideUp = function(top, duration, easing, delay) {
	return new SlideUp(top, duration, easing, delay);
}
ANM.PrependScroll = function(duration, easing, delay) {
	return new PrependScroll(duration, easing, delay);
}


/*
 * Animation implements
 ----------------------------------------------- */
var Animation = function(duration, easing, delay) {
	this.duration = duration || 200;
	this.easing = easing || 'linear';
	this.delay = delay || 0;
};


/*
 * DropDown
 ------------------------------------ */
var DropDown = function(duration, easing, delay) {
	Animation.call(this, duration, easing, delay);
};
DropDown.prototype = Object.create(Animation.prototype);
DropDown.prototype.constructor = Animation;

/** 表示 */
DropDown.prototype.show = function(target, callback) {
	var callback = callback || function(){};
	target.show();
	var defHeight = target.style.height || '';
	var end = {
		height: $(target).outerHeight(),
		opacity: target.style.opacity || 1.0
	}
	target.style.height = 0;
	target.style.opacity = 0.0;
	$(target).stop().animate({
		height: end.height,
		opacity: end.opacity
	}, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			target.style.height = defHeight;
			callback();
		}
	});
};

/** 消去 */
DropDown.prototype.hide = function(target, callback) {
	var callback = callback || function(){};
	var def = {
		height: target.style.height,
		opacity: target.style.opacity || 1.0,
		paddingTop: target.style.paddingTop,
		paddingBottom: target.style.paddingBottom,
		marginTop: target.style.marginTop,
		marginBottom: target.style.marginBottom
	}
	$(target).stop().animate({
		height: 0,
		opacity: 0.0,
		paddingTop: 0,
		paddingBottom: 0,
		marginTop: 0,
		marginBottom: 0
	}, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			target.hide();
			target.style.merge(def);
			callback();
		}
	});
};

/** 切替 */
DropDown.prototype.toggle = function(target, showCallback, hideCallback) {
	if (target.style.display == 'none') {
		this.show(target, showCallback);
	} else {
		this.hide(target, hideCallback);
	}
}


/*
 * SlideUp
 ------------------------------------ */
var SlideUp = function(startTop, duration, easing, delay) {
	duration = duration || 500;
	Animation.call(this, duration, easing, delay);
	this.startTop = startTop;
};
SlideUp.prototype = Object.create(Animation.prototype);
SlideUp.prototype.constructor = Animation;

/** 表示 */
SlideUp.prototype.show = function(target, callback) {
	var callback = callback || function(){};
	target.show();
	var endTop = target.style.top || 0;
	var endAlpha = target.style.opacity || 1.0;
	target.style.opacity = 0.0;
	target.style.top = this.startTop;
	$(target).stop().animate({ top: endTop, opacity: endAlpha }, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			target.style.opacity = endAlpha;
			target.style.top = endTop;
			callback();
		}
	});
};

/** 消去 */
SlideUp.prototype.hide = function(target, callback) {
	var callback = callback || function(){};
	var defaultTop = target.style.top || 0;
	var defaultAlpha = target.style.opacity || 1.0;
	$(target).stop().animate({ top: this.startTop, opacity: 0.0 }, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			target.hide();
			target.style.opacity = defaultAlpha;
			target.style.top = defaultTop;
			callback();
		}
	});
};

/** 切替 */
SlideUp.prototype.toggle = function(target, showCallback, hideCallback) {
	if (target.style.display == 'none') {
		this.show(target, showCallback);
	} else {
		this.hide(target, hideCallback);
	}
}


/*
 * PrependScroll
 ------------------------------------ */
var PrependScroll = function(duration, easing, delay) {
	duration = duration || 300;
	Animation.call(this, duration, easing, delay);
};
PrependScroll.prototype = Object.create(Animation.prototype);
PrependScroll.prototype.constructor = Animation;

/** 追加 */
PrependScroll.prototype.prepend = function(parent, child, callback) {
	var callback = callback || function(){};
	var endTop = 0;
	parent.prependChild(child);
	parent.style.top = endTop - $(child).outerHeight();
	$(parent).stop().animate({ top: endTop }, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			parent.style.top = endTop;
			callback();
		}
	});
};

/** 削除 */
PrependScroll.prototype.remove = function(child, callback) {
	var callback = callback || function(){};
	var parent = child.parentNode;
	if (parent == undefined || parent == null) return;
	var defTop = 0;
	var endTop = defTop - $(child).outerHeight();

	$(parent).stop().animate({ top: endTop }, {
		duration: this.duration,
		easing: this.easing,
		delay: this.delay,
		complete: function() {
			child.remove();
			parent.style.top = defTop;
			callback();
		}
	});
};

/** 切替 */
PrependScroll.prototype.toggle = function(target, appendCallback, removeCallback) {
	if (target.style.display == 'none') {
		this.prepend(target, appendCallback);
	} else {
		this.remove(target, removeCallback);
	}
}



})(window); // this file scope
