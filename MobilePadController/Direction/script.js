window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

/*
 * Controller.Direction
 * This is a handler can move within a circle. 
 * Support only 1 touch point
 * Output the offset from center in 2 format (x,y / degree,strength)
 * Output: 
 * {
 *      x: [int]            (0 - 100)
 *      y: [int]            (0 - 100)
 *      degree: [degree]    (-180 - 180, top is 0)
 *      strength: [int]     (0 - 100)
 * }
 */

(function (Controller) {
    var HTML = {
        wrap: '<div class="controller-direction"></div>',
        base: '<div class="_base"></div>',
        handler: '<div class="_handler"></div>'
    };

    var CssClass = {
        hover: '_hover'
    };

    var Env = {
        triggerRatio: 0.5         // ratio of handler trigger
    };

    var Direction = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            // html
            html_container = null,
            html_wrap = null,
            html_base = null,
            html_handler = null,
            // data
            radius = null,
            range = null,
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
            using = false;

        // callback ---------------------------------------------
        this.onChange = null;

        // public function ---------------------------------------------
        this.show = function (opts) {
            if (opts != null) _setOpts(opts);
            html_handler.removeClass(CssClass.hover);
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
            if (using) move(0,0);
            using = false;
        };

        // private function ---------------------------------------------
        // output move result
        var output = function (x, y, strength, degree) {
            handle_x = x;
            handle_y = -y;
            if (that.onChange != null) that.onChange({
                x: Math.floor(x * 100 / range),
                y: Math.floor(y * 100 / range),
                strength: Math.floor(strength*100/range),
                degree: Math.floor(degree*180/Math.PI)
            });
        };

        // move handle
        var move = function (x, y) {
            if (x==0 && y==0){
                output(0, 0, 0, 0);
                return;
            }
            x -= radius;
            y = radius-y;
            var strength = Math.sqrt(x * x + y * y);
            var degree = Math.atan2(x, y);
            if (strength > range) {
                x = x / strength * range;
                y = y / strength * range;
                strength = range;
            }
            output(x, y, strength, degree);
        };

        // update handle position
        var showHandle = function () {
            html_handler.css({
                'left': handle_x + 'px',
                'top': handle_y + 'px'
            });
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
            touch_offset_x = touch.clientX
            html_handler.addClass(CssClass.hover);
        };

        // check whether the handle pass the threshold or not
        var _checkThreshold = function (x, y) {
            return (x * x + y * y >= range * range * Env.threshold * Env.threshold);
        };

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_handler[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                _startMove(event.changedTouches[0]);
            }, false);

            html_wrap[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
            }, false);

            html_wrap[0].addEventListener('touchmove', function (event) {
                event.preventDefault();
                if (!enabled) return;
                using = true;
                if (identifier === null) {
                    for (var i = 0; i < event.changedTouches.length; i++) {
                        var touch = event.changedTouches[i];
                        var x = touch.clientX - base_offset_x - radius;
                        var y = touch.clientY - base_offset_y - radius;
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
                        html_handler.removeClass(CssClass.hover);
                        identifier = null;
                        using = false;
                        move(0, 0);
                        break;
                    }
                }
            }, false);
        };

        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            html_base = $(HTML.base).appendTo(html_wrap);
            html_handler = $(HTML.handler).appendTo(html_wrap);

            // data
            handler_size = html_handler.width();
            base_size = html_base.width();
            radius = base_size/2;
            range = (base_size - handler_size) / 2;

            // css
            html_wrap.css(_css);
            html_handler.css({
                'margin-top': range + 'px',
                'margin-left': range + 'px'
            });
        };

        var _setOpts = function (opts) {
            if (opts.css) _css = opts.css;
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
    Controller.Direction = Direction;
    Controller.Env = Env;
})(window.Rendxx.Game.Client.Controller);