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

    var Direction = function (opts) {
        // private property
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
            offset_x = null,
            offset_y = null,
            identifier = null,
            // flag
            enabled = false,
            using = false;

        // callback
        this.onChange = null;

        // public function
        this.show = function (opts) {
            if (opts != null) _setOpts(opts);
            html_wrap.show();

            var rect = html_wrap[0].getBoundingClientRect()
            offset_x = rect.left;
            offset_y = rect.top;
            enabled = true;
        };

        this.hide = function () {
            enabled = false;
            html_wrap.hide();
            if (using) move(0,0);
            using = false;
        };

        // private function
        var output = function (x, y, strength, degree){
            html_handler.css({
                'left': x + 'px',
                'top': -y + 'px'
            });

            if (that.onChange != null) that.onChange({
                x: Math.floor(x * 100 / range),
                y: Math.floor(y * 100 / range),
                strength: Math.floor(strength*100/range),
                degree: Math.floor(degree*180/Math.PI)
            });
        };

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

        // setup
        var _setupFunc = function () {
            html_wrap[0].addEventListener('touchstart', function (e) {
                event.preventDefault();
                if (!enabled) return;
                if (identifier !== null) return;
                identifier = event.changedTouches[0].identifier;
                //var touch = event.changedTouches[0];
            }, false);

            html_wrap[0].addEventListener('touchmove', function (e) {
                event.preventDefault();
                if (!enabled) return;
                using = true;
                if (identifier === null) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    console.log(touch);
                    if (touch.identifier == identifier) {
                        move(touch.clientX - offset_x, touch.clientY - offset_y);
                        break;
                    }
                }
            }, false);

            html_wrap[0].addEventListener('touchend', function (e) {
                event.preventDefault();
                if (!enabled) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
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
            var handler_size = html_handler.width();
            var base_size = html_base.width();
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
})(window.Rendxx.Game.Client.Controller);