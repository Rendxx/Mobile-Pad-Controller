window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

/*
 * Controller.Move
 * This is a control handler for mobile. 
 * User can move the handler in a circle or tap it.
 * Support only 1 touch point
 * 
 * 3 callback:
 * Output the offset from center in 2 format (x,y / degree,strength)
 * onMove: 
 * ({
 *      x: [int]            (0 - 100)
 *      y: [int]            (0 - 100)
 *      degree: [degree]    (-180 - 180, top is 0)
 * })
 * 
 * onTap()
 * onStop()
 */

(function (Controller) {
    "use strict";
    var HTML = {
        wrap: '<div class="controller-move"></div>',
        base: '<div class="_base"></div>',
        point: '<div class="_point"></div>',
    };

    var Env = {
        moveThreshold: 10          // any moving not pass this threshold will not be recognized
    };

    var Move = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            _threshold = Env.moveThreshold,
            // html
            html_container = null,
            html_wrap = null,
            html_base = null,
            line = null,
            // data
            animationId = null,
            text = null,
            range= null,
            base_offset_x = null,
            base_offset_y = null,
            identifier = null,
            cache_x = null,
            cache_y = null,
            line_x = null,
            line_y = null,
            // flag
            enabled = false,
            using = false,
            tapTime = null;

        // callback ---------------------------------------------
        this.onStop = null;
        this.onMove = null;
        this.onTap = null;

        // public function ---------------------------------------------
        this.show = function (opts) {
            if (opts != null) _setOpts(opts);
            html_base.attr('data-content', text);
            html_wrap.show();

            var rect = html_wrap[0].getBoundingClientRect()
            base_offset_x = rect.left;
            base_offset_y = rect.top;
            enabled = true;
            showHandle();
        };

        this.hide = function () {
            enabled = false;
            html_wrap.hide();
            if (using && that.onStop) that.onStop();
            using = false;
            removeAnimation();
        };

        // private function ---------------------------------------------

        // update handle position
        var showHandle = function () {
            if (line_x!==null) line.lineTo(line_x, line_y);
            animationId = requestAnimationFrame(showHandle);
        };

        // clear handler animation
        var removeAnimation = function () {
            if (animationId !== null) cancelAnimationFrame(animationId);
            animationId = null;
        };

        // output move result
        var output = function (x, y, degree) {
            if (that.onMove != null) that.onMove({
                x: Math.floor(x * 100 / range),
                y: Math.floor(y * 100 / range),
                degree: Math.floor(degree * 180 / Math.PI)
            });
            //console.log(x + " , " + y)
        };

        // move handle
        var move = function (x_in, y_in) {
            var x = x_in - cache_x;
            var y = cache_y - y_in;

            var strength = Math.sqrt(x * x + y * y);
            if (strength > _threshold) {
                tapTime = null;
            }
            if (strength > _threshold) {
                var degree = Math.atan2(x, y);
                output(x, y, degree);
            }
        };

        // try starting moving handle
        var _startMove = function (touch) {
            if (identifier !== null) return;
            identifier = touch.identifier;
            cache_x = touch.clientX;
            cache_y = touch.clientY;
            line.moveTo(touch.clientX - base_offset_x, touch.clientY - base_offset_y);
            line.lineTo(touch.clientX - base_offset_x, touch.clientY - base_offset_y);
            line.show();
        };

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_wrap[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                _startMove(event.changedTouches[0]);
                tapTime = (new Date()).getTime();
            }, false);

            html_wrap[0].addEventListener('touchmove', function (event) {
                event.preventDefault();
                if (!enabled) return;
                using = true;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        line_x = touch.clientX - base_offset_x;
                        line_y = touch.clientY - base_offset_y;
                        move(touch.clientX, touch.clientY);
                        break;
                    }
                }
            }, false);

            html_wrap[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                if (!enabled) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        if (tapTime != null && (new Date()).getTime() - tapTime < 300) {
                            if (that.onTap) that.onTap();
                        };
                        tapTime = null;
                        identifier = null;
                        using = false;
                        if (that.onStop) that.onStop();
                        line.hide();
                        line_x = line_y = null;
                        break;
                    }
                }
            }, false);
        };

        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            html_base = $(HTML.base).appendTo(html_wrap);

            line = $$.drawing.create("Line", {
                "container": html_wrap,
                "z-index": 50,
                "css": {
                    body: {
                        "z-index": 1,
                        "width": 64,
                        "background-image": 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAECAYAAAA+oDmkAAAA1UlEQVQ4jcXRwUlDURCF4W/ue4kLFyK4yELElYsgFmAZgpVYgQ1YgE1YhCUIgSytQHfyXt69103QIJEQo/hvhuHAmTMzodZwK0yFF0knGSRHkjetRmOhNdYatBhJxrKxak/6UrnCMZrLidPzQydwdsDNhY3MX7l7+uzvZx6FosrCg+pZ6IRO0X/URi/rsdAadAb7siIbZJ1sopoppqprRURtN0daoREIdY1WhCRgrb4raWXGOv9BGC3zbWm7PXll2f8m7ZblZwf4LkD546PE0j/Ebz3hHRmGPicsZ2DRAAAAAElFTkSuQmCC")'
                    },
                    start: {
                        "z-index": 3,
                        "width": "64px",
                        "height": "64px",
                        "background-image": 'url("data:image/png;base64,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")'
                    },
                    end: {
                        "z-index": 2,
                        "width": "64px",
                        "height": "64px",
                        "background-image": 'url("data:image/png;base64,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")'
                    }
                }
            });
            line.hide();

            // data
            range = html_base.width();

            // css
            html_wrap.css(_css);
        };

        var _setOpts = function (opts) {
            if (opts.threshold) _threshold = opts.threshold;
            if (opts.css) _css = opts.css;
            if (opts.text) text = opts.text;
        };

        var _init = function (opts) {
            if (opts == null) throw new Error("Option can not be empty");
            html_container = opts.container;
            _setOpts(opts);
            _setupHtml();
            _setupFunc();
            that.hide();
        };
        _init(opts);
    };
    Controller.Move = Move;
    Controller.Move.Env = Env;
})(window.Rendxx.Game.Client.Controller);