window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

(function (Controller) {
    var HTML = {
        wrap: '<div class="controller-direction"></div>',
        base: '<div class="_base"></div>',
        handler: '<div class="_handler"></div>'
    };

    var Direction = function (opts) {
        // private property
        var that = this,
            pos_top = null,
            pos_bottom = null,
            pos_left = null,
            pos_right = null,
            html_container = null,
            html_wrap = null,
            html_base = null,
            html_handler = null;

        // function
        var _bindFunc = function () {

        };

        // setup
        var _setupHtml = function () {
            // html
            html_wrap = $(HTML.wrap).appendTo(html_container);
            html_base = $(HTML.base).appendTo(html_wrap);
            html_handler = $(HTML.handler).appendTo(html_wrap);

            // css
            html_wrap.css({
                'top': pos_top === null ? 'auto' : pos_top,
                'bottom': pos_bottom === null ? 'auto' : pos_bottom,
                'left': pos_left === null ? 'auto' : pos_left,
                'right': pos_right === null ? 'auto' : pos_right,
            });
            var handler_size = html_handler.width();
            var base_size = html_base.width();
            html_handler.css({
                'margin-top': (base_size - handler_size) / 2,
                'margin-left': (base_size - handler_size) / 2
            })
        };

        var _init = function (opts) {
            if (opts == null) throw new Error("Option can not be empty");
            html_container = opts.container;
            if (opts.top) pos_top = opts.top;
            if (opts.bottom) pos_bottom = opts.bottom;
            if (opts.left) pos_left = opts.left;
            if (opts.right) pos_right = opts.right;

            _setupHtml();

        };
        _init();
    };
    Controller.Direction = Direction;
})(window.Rendxx.Game.Client.Controller);