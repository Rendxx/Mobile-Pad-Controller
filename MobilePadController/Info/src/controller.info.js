window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

/*
 * Controller.Info
 * This is a control handler for mobile. 
 * A panel will cover whole screen.
 * Support only 1 touch point
 * 
 * 1 callback:
 * onTap()
 */

(function (Controller) {
    var HTML = {
        wrap: '<div class="controller-info"></div>'
    };

    var CssClass = {
        hide: '_hide'
    };

    var Env = {
    };

    var Info = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            // html
            html_container = null,
            html_wrap = null,
            // data
            content = null,
            // cache
            hideFunc = null;

        // callback ---------------------------------------------
        this.onTap = null;

        // public function ---------------------------------------------
        this.show = function (opts) {
            if (opts != null) _setOpts(opts);
            if (hideFunc != null) {
                clearTimeout(hideFunc);
                hideFunc = null;
            }
            html_wrap.html(content);
            html_wrap.show();
            html_wrap.removeClass(CssClass.hide);
        };

        this.hide = function () {
            html_wrap.addClass(CssClass.hide);            
            hideFunc = setTimeout(300, function () { html_wrap.hide(); hideFunc = null; });
        };

        this.resize = function () {
            // data

            // css
            html_wrap.css(_css);
        };

        this.reset = function (opts) {
            _setOpts(opts);
            this.resize();
        };

        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_wrap[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                if (that.onTap) that.onTap();
            }, false);
        };

        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            that.resize();
        };

        var _setOpts = function (opts) {
            if (opts.css) _css = opts.css;
            if (opts.content) content = opts.content;
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
    Controller.Info = Info;
    Controller.Info.Env = Env;
})(window.Rendxx.Game.Client.Controller);