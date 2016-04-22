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
        wrap: '<div class="controller-button"></div>',
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

    var Button = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            // html
            html_container = null,
            html_wrap = null,
            html_handler = null,
            // data
            text = null,
            identifier = null,
            // flag
            enabled = false,
            using = false,
            tapTime = null;

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

        // private function ---------------------------------------------

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_handler[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                if (identifier !== null) return;
                var touch = event.changedTouches[0];
                identifier = touch.identifier;
                tapTime = (new Date()).getTime();
                html_handler.addClass(CssClass.hover);
                if (that.onPress) that.onPress();
            }, false);

            html_handler[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                if (!enabled) return;
                for (var i = 0; i < event.changedTouches.length; i++) {
                    touch = event.changedTouches[i];
                    if (touch.identifier == identifier) {
                        if (that.onRelease) that.onRelease();
                        if (tapTime != null && (new Date()).getTime() - tapTime < 300) {
                            if (that.onTap) that.onTap();
                        };
                        tapTime = null;
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
    Controller.Button = Button;
    Controller.Button.Env = Env;
})(window.Rendxx.Game.Client.Controller);