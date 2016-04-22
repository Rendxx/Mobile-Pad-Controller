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
 * 2 callback:
 * Output the offset from center in 2 format (x,y / degree,strength)
 * onMove: 
 * ({
 *      x: [int]            (0 - 100)
 *      y: [int]            (0 - 100)
 *      degree: [degree]    (-180 - 180, top is 0)
 *      strength: [int]     (0 - 100)
 * })
 * 
 * onTap()
 */

(function (Controller) {
    var HTML = {
        wrap: '<div class="controller-move"></div>',
        base: '<div class="_base"></div>',
    };

    var CssClass = {
        hover: '_hover'
    };

    var Env = {
        triggerRatio: 0.5,          // ratio of handler trigger
        tapThreshold: 0.1,          // threshold of tapping the handler
        moveThreshold: 0.1          // any moving not pass this threshold will not be recognized
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
            line = null,
            // data
            text = null,
            radius = null,      // radius of handler
            range = null,       // handler move range 
            base_offset_x = null,
            base_offset_y = null,
            touch_offset_x = null,
            touch_offset_y = null,
            identifier = null,
            handle_x = null,
            handle_y = null,
            animationId = null,
            handler_size = null,
            base_size = null,
            // flag
            enabled = false,
            using = false,
            tapTime = null;

        // callback ---------------------------------------------
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
            removeAnimation();
            html_wrap.hide();
            if (using) move(0, 0);
            using = false;
        };

        // private function ---------------------------------------------
        // output move result
        var output = function (x, y, strength, degree) {
            handle_x = x;
            handle_y = -y;
            if (strength == 0 && degree == 0) if (that.onMove != null) that.onMove(0, 0, 0, 0);
            if (strength <= range * Env.moveThreshold) return;
            if (that.onMove != null) that.onMove({
                x: Math.floor(x * 100 / range),
                y: Math.floor(y * 100 / range),
                strength: Math.floor(strength * 100 / range),
                degree: Math.floor(degree * 180 / Math.PI)
            });
        };

        // move handle
        var move = function (x, y) {
            x += touch_offset_x;
            y += touch_offset_y;
            if (x == 0 && y == 0) {
                output(0, 0, 0, 0);
                return;
            }
            x -= radius;
            y = radius - y;
            var strength = Math.sqrt(x * x + y * y);
            if (strength > range * Env.tapThreshold) tapTime = null;
            var degree = Math.atan2(x, y);
            if (strength > range) {
                x = x / strength * range;
                y = y / strength * range;
                strength = range;
            }
            line.lineTo(x, y);
            output(x, y, strength, degree);
        };

        // update handle position
        var showHandle = function () {
            animationId = requestAnimationFrame(showHandle);
        };

        // clear handler animation
        var removeAnimation = function () {
            if (animationId !== null) cancelAnimationFrame(animationId);
            animationId = null;
        };

        // try starting moving handle
        var _startMove = function (touch) {
            if (identifier !== null) return;
            identifier = touch.identifier;
            touch_offset_x = base_size / 2 - touch.clientX + base_offset_x;
            touch_offset_y = base_size / 2 - touch.clientY + base_offset_y;
            line.moveTo(touch_offset_x, touch_offset_y);
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
                if (identifier === null) {
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        var x = touch.clientX - base_offset_x - base_size / 2;
                        var y = touch.clientY - base_offset_y - base_size / 2;
                        if (x * x + y * y <= handler_size * handler_size * Env.triggerRatio * Env.triggerRatio / 4) {
                            _startMove(touch);
                            break;
                        }
                    }
                    return;
                }
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        move(touch.clientX - base_offset_x, touch.clientY - base_offset_y);
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
                        if (tapTime != null && (new Date()).getTime()-tapTime<300) {
                            if (that.onTap) that.onTap();
                        };
                        tapTime = null;
                        identifier = null;
                        using = false;
                        touch_offset_x = 0;
                        touch_offset_y = 0;
                        move(0, 0);
                        line.hide();
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
                "width": 64,
                "z-index": 10,
                "reduce": 15,
                "background": {
                    image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAECAYAAAA+oDmkAAAAnklEQVQ4je3Qu20CURSE4e/sA8PiiApIoQcyWnALpiZowS04cw8mdQVEvAy7e0muhKiAwP6l0Yw0yWgCpBTgQ+FbmCi1Ci9KoRZq1CoDVwOFoTBEg0YyEsZ4xRij7A2WqFC+z0xl1gsPrL7uebP1gw4tPnHEAafse8lBOOXuKDnrndUuWhdcpaxfnUpvpzOXvOlBRCr8cf4PePaAZ3MDtvYtCKYoDGgAAAAASUVORK5CYII='
                },
                pointer: {
                    end: {
                        image: 'data:image/png;base64,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',
                        position: "0px 0px",
                        radius: 32
                    }
                }
            });
            line.hide();

            // data
            base_size = html_base.width();
            radius = base_size / 2;
            range = (base_size - handler_size) / 2;

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