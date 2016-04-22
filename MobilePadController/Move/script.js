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
    var HTML = {
        wrap: '<div class="controller-move"></div>',
        base: '<div class="_base"></div>',
        point: '<div class="_point"></div>',
    };

    var Env = {
        tapThreshold: 5,          // threshold of tapping the handler
        moveThreshold: 5          // any moving not pass this threshold will not be recognized
    };

    var Move = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            // html
            html_container = null,
            html_wrap = null,
            html_base = null,
            html_point = null,
            // data
            text = null,
            base_offset_x = null,
            base_offset_y = null,
            identifier = null,
            cache_x = null,
            cache_y = null,
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
        };

        this.hide = function () {
            enabled = false;
            html_wrap.hide();
            if (using && that.onStop) that.onStop();
            using = false;
        };

        // private function ---------------------------------------------
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
            var y = y_in - cache_y;

            var strength = Math.sqrt(x * x + y * y);
            if (strength > Env.tapThreshold) {
                tapTime = null;
            }
            if (strength > Env.moveThreshold) {
                var degree = Math.atan2(x, y);
                output(x, y, degree);
                cache_x = x_in;
                cache_y = y_in;
            }
        };

        // try starting moving handle
        var _startMove = function (touch) {
            if (identifier !== null) return;
            identifier = touch.identifier;
            html_point.css({
                "top": touch.clientY - base_offset_y + "px",
                "left": touch.clientX - base_offset_x + "px"
            });
            cache_x = touch.clientX;
            cache_y = touch.clientY;
            html_point.show();
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
                        html_point.css({
                            "top": touch.clientY - base_offset_y + "px",
                            "left": touch.clientX - base_offset_x + "px"
                        });
                        move(touch.clientX, touch.clientY);
                        break;
                    }
                }
            }, false);

            html_wrap[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                if (!enabled) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        if (tapTime != null && (new Date()).getTime() - tapTime < 300) {
                            if (that.onTap) that.onTap();
                        };
                        tapTime = null;
                        identifier = null;
                        using = false;
                        if (that.onStop) that.onStop();
                        html_point.hide();
                        break;
                    }
                }
            }, false);
        };

        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            html_base = $(HTML.base).appendTo(html_wrap);
            html_point = $(HTML.point).appendTo(html_wrap);
            html_point.hide();

            // data
            range = html_base.width();

            // css
            html_wrap.css(_css);
        };

        var _setOpts = function (opts) {
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