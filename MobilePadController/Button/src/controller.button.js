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
    "use strict";
    var HTML = {
        wrap: '<div class="controller-button"></div>',
        handler: '<div class="_handler"></div>',
        sensor: '<div class="_sensor"></div>'
    };

    var CssClass = {
        hover: '_hover',
        brief: '_brief'
    };

    var Env = {
        triggerRatio: 0.5,          // ratio of handler trigger
        tapThreshold: 0.1,          // threshold of tapping the handler
        moveThreshold: 0.1          // any moving not pass this threshold will not be recognized
    };

    var Button = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            _cssHandler = null,
            // html
            html_container = null,
            html_wrap = null,
            html_handler = null,
            html_sensor = null,
            // data
            text = null,
            identifier = null,
            pressingFunc = null,
            isBrief = null,
            // flag
            enabled = false,
            using = false;

        // callback ---------------------------------------------
        this.onTap = null;
        this.onPress = null;
        this.onRelease = null;

        // public function ---------------------------------------------
        this.show = function (opts) {
            if (opts != null) _setOpts(opts);
            html_handler.removeClass(CssClass.hover);
            html_wrap.attr('data-content', text);
            html_wrap.show();

            enabled = true;
        };

        this.hide = function () {
            enabled = false;
            html_wrap.hide();
            using = false;
        };

        this.resize = function () {
            if (_css !== null) html_wrap.css(_css);
            html_handler.css({
                'width': html_wrap.width() - 20,
                'height': html_wrap.height() - 20,
                'top': '10px',
                'left': '10px'
            });
            if (_cssHandler !== null) html_handler.css(_cssHandler);

            if (isBrief === true) {
                html_wrap.addClass(CssClass.brief);
                html_handler.css({
                    'background': 'none',
                    'background-image': 'none',
                    'background-color': 'none'
                });
            } else {
                html_wrap.removeClass(CssClass.brief);
            }
        };

        this.reset = function (opts) {
            _setOpts(opts);
            this.resize();
        };

        // private function ---------------------------------------------

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_sensor[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                if (identifier !== null) return;
                var touch = event.changedTouches[0];
                identifier = touch.identifier;
                html_handler.addClass(CssClass.hover);
                if (pressingFunc !== null) clearTimeout(pressingFunc);
                pressingFunc = setTimeout(function () {
                    pressingFunc = null;
                    if (that.onPress) that.onPress();
                }, 200);
            }, false);

            html_sensor[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                if (!enabled) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    var touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        if (pressingFunc === null) {
                            if (that.onRelease) that.onRelease();
                        } else {
                            clearTimeout(pressingFunc);
                            pressingFunc = null;
                            if (that.onTap) that.onTap();
                        }
                        html_handler.removeClass(CssClass.hover);
                        identifier = null;
                        using = false;
                        break;
                    }
                }
            }, false);
        };

        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            html_handler = $(HTML.handler).appendTo(html_wrap);
            html_sensor = $(HTML.sensor).appendTo(html_wrap);
            // css
            that.resize();
        };

        var _setOpts = function (opts) {
            if (opts.css) _css = opts.css;
            if (opts.cssHandler) _cssHandler = opts.cssHandler;
            if (opts.text) text = opts.text;
            if (opts.isBrief === true) {
                isBrief = true;
                if (html_wrap != null) html_wrap.addClass(CssClass.brief);
            } else {
                isBrief = false;
                if (html_wrap != null) html_wrap.removeClass(CssClass.brief);
            }
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
    Controller.Button = Button;
    Controller.Button.Env = Env;
})(window.Rendxx.Game.Client.Controller);