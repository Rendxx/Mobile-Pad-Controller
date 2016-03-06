window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

/*
 * Controller.Direction
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
        wrap: '<div class="controller-direction"></div>',
        base: '<div class="_base"></div>',
        handler: '<div class="_handler"></div>'
    };

    var CssClass = {
        hover: '_hover'
    };

    var Env = {
        triggerRatio: 0.5,          // ratio of handler trigger
        tapThreshold: 0.1,          // threshold of tapping the handler
        moveThreshold: 0.1          // any moving not pass this threshold will not be recognized
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
            html_handler.removeClass(CssClass.hover);
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
            touch_offset_x = base_size / 2 - touch.clientX + base_offset_x;
            touch_offset_y = base_size / 2 - touch.clientY + base_offset_y;
            html_handler.addClass(CssClass.hover);
        };

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_handler[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                _startMove(event.changedTouches[0]);
                tapTime = (new Date()).getTime();
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
                        html_handler.removeClass(CssClass.hover);
                        identifier = null;
                        using = false;
                        touch_offset_x = 0;
                        touch_offset_y = 0;
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
            radius = base_size / 2;
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
    Controller.Direction = Direction;
    Controller.Env = Env;
})(window.Rendxx.Game.Client.Controller);