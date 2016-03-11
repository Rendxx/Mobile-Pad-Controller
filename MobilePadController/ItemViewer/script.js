window.Rendxx = window.Rendxx || {};
window.Rendxx.Game = window.Rendxx.Game || {};
window.Rendxx.Game.Client = window.Rendxx.Game.Client || {};
window.Rendxx.Game.Client.Controller = window.Rendxx.Game.Client.Controller || {};

/*
 * Controller.ItemViewer
 * This is a control handler for mobile. 
 * User touch the button to see all items. 
 * A full-screen panel will show when user keep hovering the button.
 * The panel will disappear if user touch end.
 * Support only 1 touch point
 * 
 * 2 callback:
 * onShow()
 * onHide()
 */

(function (Controller) {
    var HTML = {
        wrap: '<div class="controller-itemViewer"><div class="_inner"></div></div>',
        btn: '<div class="controller-itemViewer-btn"></div>',
        item: '<div class="_item"><span></span></div>',
        close: '<div class="_close"></div>'
    };

    var CssClass = {
        hover: '_hover'
    };

    var ItemViewer = function (opts) {
        // private property ---------------------------------------------
        var that = this,
            // parameters
            _css = null,
            // html
            html_container = null,
            html_wrap2 = null,
            html_wrap = null,
            html_btn = null,
            html_close = null,
            html_item = {},
            // data
            items = {},
            // flag
            enabled = false,
            shown = false;

        // callback ---------------------------------------------
        this.onShow = null;
        this.onHide = null;

        // public function ---------------------------------------------
        this.show = function () {
            html_wrap.show();
            shown = true;
        };

        this.hide = function () {
            html_wrap.hide();
            shown = false;
        };

        this.enable = function () {
            enabled = true;
            html_btn.show();
        };

        this.disable = function () {
            enabled = false;
            html_btn.hide();
            this.hide();
        };

        this.addItem = function (id, name, icon) {
            items[id] = {
                id: id,
                name: name,
                icon: icon
            };

            var ele = $(HTML.item).appendTo(html_wrap);
            ele.find('span').html(name);
            if (icon !== undefined) ele.css('background-image', 'url("'+ icon +'")');
            html_item[id] = ele;
        };

        this.clear = function () {
            items = {};
            html_wrap.empty();
        };

        // private function ---------------------------------------------
        // setup ---------------------------------------------
        var _setupFunc = function () {
            html_btn[0].addEventListener('touchstart', function (event) {
                event.preventDefault();
                if (!enabled) return;
                that.show();
            }, false);

            html_btn[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                that.hide();
            }, false);

            html_wrap[0].addEventListener('touchend', function (event) {
                event.preventDefault();
                that.hide();
            }, false);

            html_btn.mousedown(function (event) {//touchstart
                event.preventDefault();
                if (!enabled) return;
                that.show();
            });

            html_btn.mouseup(function (event) {//touchend
                event.preventDefault();
                that.hide();
            });

            html_wrap.mouseup(function (event) {//touchend
                event.preventDefault();
                that.hide();
            });
        };

        var _setupHtml = function () {
            // html
            html_wrap2 = $(HTML.wrap).appendTo(html_container);
            html_wrap = html_wrap2.find('._inner');
            html_btn = $(HTML.btn).appendTo(html_container);
            // css
            html_btn.css(_css);
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
            that.disable();
        };
        _init(opts);
    };
    Controller.ItemViewer = ItemViewer;
})(window.Rendxx.Game.Client.Controller);