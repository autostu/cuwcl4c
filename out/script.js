// ==UserScript==
// @grant          unsafeWindow
// @grant          GM_xmlhttpRequest
// @grant          GM_openInTab
// @grant          GM_registerMenuCommand
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_info

// @run-at         document-start
// @name:en        Bypass Wait, Code & Login on Websites
// @name           跳过网站等待、验证码及登录
// @name:zh-CN     跳过网站等待、验证码及登录
// @name:zh-TW     繞過站點等待、識別碼及登錄

// @description       移除各类网站验证码、登录、倒计时及更多!
// @description:zh-CN 移除各类网站验证码、登录、倒计时及更多!
// @description:zh-TW 移除各類站點識別碼、登錄、倒計時及更多!
// @description:en    Remove verify code, login requirement, counting down... and more!


// @copyright      2014+, Yulei, Mod by Jixun.
////               Based on [Crack Url Wait Code Login] By Yulei

// 避免 Source Map 文件找不到的错误
// @require        https://cdn.bootcss.com/jquery/2.1.4/jquery.js
// @require        https://cdn.bootcss.com/underscore.js/1.8.3/underscore.js

/// CryptoJS 相关库
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/core-min.js
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/enc-base64-min.js
// @require        https://cdn.bootcss.com/crypto-js/3.1.2/components/md5-min.js
// @require        https://greasyfork.org/scripts/6696/code/CryptoJS-ByteArray.js

/// 非同步枚举
// @require        https://greasyfork.org/scripts/3588-interval-looper/code/Interval-Looper.js

/// 兼容 GM 1.x, 2.x
// @require        https://greasyfork.org/scripts/2599/code/gm2-port-v104.js

/// Aria2 RPC
// @require        https://greasyfork.org/scripts/5672/code/Aria2-RPC-build-10.js

// @author         Jixun.Moe<Yellow Yoshi>
// @namespace      http://jixun.org/
// @version        4.0.600

// 尝试使用脚本生成匹配规则
// ////               [Include Rules]

// @include http://localhost.cuwcl4c/*
// @include http://jixunmoe.github.io/*
// @include http://123564.com/*
// @include http://m.123564.com/*
// @include http://123564.com/*
// @include http://m.123564.com/*
// @include http://yun.baidu.com/*
// @include http://pan.baidu.com/*
// @include http://howfile.com/*
// @include http://*.howfile.com/*
// @include http://namipan.cc/*
// @include http://*.namipan.cc/*
// @include http://webhd.xuite.net/*
// @include http://sync.hamicloud.net/*
// @include http://douban.fm/*
// @include https://douban.fm/*
// @include http://moe.fm/*
// @include https://moe.fm/*
// @include https://jixunmoe.github.io/cuwcl4c/config/

// GM_xmlHttpRequest 远端服务器列表
// @connect down.lepan.cc
// @connect music.baidu.com
// @connect yinyueyun.baidu.com
// @connect media.store.kugou.com
// @connect trackercdn.kugou.com
// @connect yinyuetai.com
// @connect itwusun.com

// ==/UserScript==
var define = (function () {
    var _modules = {};
    return define;
    function define(module, requires, callback) {
        var _this_module = {
            exports: {}
        };
        var params = requires.map(function (module) {
            if (module == 'exports') {
                return _this_module.exports;
            }
            else if (module == 'require') {
                return require;
            }
            return require(module);
        });
        callback.apply(this, params);
        _modules[module] = _this_module.exports;
    }
    function require(module) {
        return _modules[module];
    }
})();
define("helper/Script", ["require", "exports"], function (require, exports) {
    "use strict";
    var Script;
    (function (Script) {
        Script.Name = "CUWCL4C";
        Script.Home = "https://greasyfork.org/zh-CN/scripts/2600";
        Script.Config = "https://jixunmoe.github.io/cuwcl4c/config/";
        Script.Feedback = "https://greasyfork.org/forum/post/discussion?Discussion/ScriptID=2600";
        function ListenEvent(listener) {
            document.addEventListener(Script.Name, function (e) {
                var info;
                if (typeof e.detail == 'string') {
                    info = JSON.parse(e.detail);
                }
                else {
                    info = e.detail;
                }
                listener(info);
            });
        }
        Script.ListenEvent = ListenEvent;
    })(Script = exports.Script || (exports.Script = {}));
});
define("helper/Constants", ["require", "exports"], function (require, exports) {
    "use strict";
    // 常数
    exports.isFrame = _isFrame();
    exports.version = GM_info.script.version;
    exports.currentUrl = location.href.split('#')[0];
    exports.lowerHost = location.hostname.toLowerCase();
    exports.topHost = exports.lowerHost.match(/\w+\.?\w+?$/)[0];
    exports.topHostMask = "." + exports.topHost;
    exports.downloadIcon = 'jx_dl';
    exports.downloadIconClass = '.jx_dl';
    function _isFrame() {
        try {
            return unsafeWindow.top !== unsafeWindow.self;
        }
        catch (e) {
            return true;
        }
    }
});
define("helper/ScriptConfig", ["require", "exports", "helper/Script"], function (require, exports, Script_1) {
    "use strict";
    (function (UriType) {
        UriType[UriType["NormalUrl"] = 0] = "NormalUrl";
        /** @deprecated use others instead. */
        UriType[UriType["Custom"] = 1] = "Custom";
        UriType[UriType["Aria"] = 2] = "Aria";
    })(exports.UriType || (exports.UriType = {}));
    var UriType = exports.UriType;
    exports.Config = $.extend({
        bDiaplayLog: true,
        bInternational: false,
        bUseCustomRules: false,
        bUseThridOnFail: false,
        dAria_auth: Aria2.AUTH.noAuth,
        dAria_port: 6800,
        dUriType: UriType.NormalUrl,
        sAria_dir: "D:\\Download\\",
        sAria_host: "127.0.0.1",
        sAria_pass: "",
        sAria_user: "",
        sCustomRule: ""
    }, ReadConfig());
    function ReadConfig() {
        try {
            return JSON.parse(GM_getValue(Script_1.Script.Name, ""));
        }
        catch (ex) {
            return {};
        }
    }
});
define("helper/Extension", ["require", "exports"], function (require, exports) {
    "use strict";
    function BeginWith(str, what) {
        return str.indexOf(what) === 0;
    }
    exports.BeginWith = BeginWith;
    function EndWith(str, what) {
        return str.slice(-what.length) == what;
    }
    exports.EndWith = EndWith;
    function Contains(str, what) {
        return str.indexOf(what) != -1;
    }
    exports.Contains = Contains;
    function GetFirstKey(obj) {
        return Object.keys(obj)[0];
    }
    exports.GetFirstKey = GetFirstKey;
    function GetFirstValue(obj) {
        try {
            return obj[GetFirstKey(obj)];
        }
        catch (ex) {
            return null;
        }
    }
    exports.GetFirstValue = GetFirstValue;
    /**
     * 从链接获取文件后缀名。
     * 包括 `.` 字符，如 `.ts`
     */
    function GetExtensionFromUrl(url) {
        var m = url.match(/.+\/(?:[^.]+(\..+?))(?:\?|$)/);
        return m ? m[1] : null;
    }
    exports.GetExtensionFromUrl = GetExtensionFromUrl;
    // Fisher-Yates Shuffle by community wiki(?)
    // http://stackoverflow.com/a/6274398
    function Shuffle() {
        var array = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            array[_i - 0] = arguments[_i];
        }
        var counter = array.length;
        var temp, index;
        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            index = Math.floor(Math.random() * counter);
            // Decrease counter by 1
            counter--;
            // And swap the last element with it
            temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }
        return array;
    }
    exports.Shuffle = Shuffle;
});
define("helper/QueryString", ["require", "exports", "helper/Extension"], function (require, exports, Extension_1) {
    "use strict";
    function GetFlashVars(el) {
        if (!el)
            return {};
        var ele = ('jquery' in el ? el[0] : el);
        if (ele.getAttribute('type') != 'flash')
            return {};
        var flashVars = {};
        var size = ele.childNodes.length;
        var flashObject;
        for (var i = size; i--;) {
            if (ele.childNodes[i].name == 'flashvars') {
                flashObject = ele.childNodes[i];
                flashObject.value.replace(/&amp;/g, '&')
                    .replace(/([\s\S]+?)=([\s\S]+?)(&|$)/g, function (n, key, value) {
                    // 利用正则的批量替换功能抓取数据
                    flashVars[key] = decodeURIComponent(value);
                    return '';
                });
                return flashVars;
            }
        }
        return {};
    }
    exports.GetFlashVars = GetFlashVars;
    function Parse(query) {
        var urlParams;
        if (Extension_1.Contains(query, '?')) {
            urlParams = query.slice(query.indexOf('?') + 1).split('&');
        }
        else {
            urlParams = query.split('&');
        }
        var ret = {};
        var queryStr;
        var posEqual;
        for (var i = urlParams.length; i--;) {
            queryStr = urlParams[i].toString();
            posEqual = queryStr.indexOf('=');
            if (posEqual == -1)
                continue;
            ret[decodeURIComponent(queryStr.slice(0, posEqual))] =
                decodeURIComponent(queryStr.slice(posEqual + 1));
        }
        return ret;
    }
    exports.Parse = Parse;
});
define("helper/Logger", ["require", "exports", "helper/Script", "helper/ScriptConfig"], function (require, exports, Script_2, ScriptConfig_1) {
    "use strict";
    function DoLog(prefix, method, args) {
        if (args.length < 1)
            return;
        if (typeof args[0] == 'string') {
            args[0] = "[" + Script_2.Script.Name + "][" + prefix + "] " + args[0];
        }
        else {
            args.splice(0, 0, "[" + Script_2.Script.Name + "][" + prefix + "] " + args[0]);
        }
        console[method].apply(console, args);
    }
    function WrapLog(prefix, method) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i - 0] = arguments[_i];
            }
            return DoLog(prefix, method, args);
        };
    }
    function DoNothing() { }
    exports.log = DoNothing;
    exports.info = DoNothing;
    exports.error = DoNothing;
    exports.warn = DoNothing;
    if (ScriptConfig_1.Config.bDiaplayLog) {
        exports.log = WrapLog('日志', 'log');
        exports.info = WrapLog('信息', 'info');
        exports.error = WrapLog('错误', 'error');
        exports.warn = WrapLog('警告', 'warn');
    }
});
define("helper/StyleSheet", ["require", "exports"], function (require, exports) {
    "use strict";
    var StyleSheet = (function () {
        function StyleSheet() {
            this.style = document.createElement('style');
            this.Apply();
        }
        StyleSheet.prototype.Add = function () {
            var styleText = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                styleText[_i - 0] = arguments[_i];
            }
            this.style.textContent += '\n' + styleText.join('\n');
        };
        StyleSheet.prototype.Hide = function (selector) {
            var selectors = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                selectors[_i - 1] = arguments[_i];
            }
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = selectors.join(', ') + " { display: none !important }";
            this.Add(styleText);
        };
        StyleSheet.prototype.Show = function (selector) {
            var selectors = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                selectors[_i - 1] = arguments[_i];
            }
            if ('string' == typeof selector) {
                selectors.splice(0, 0, selector);
            }
            else {
                selectors = selector;
            }
            var styleText = selectors.join(', ') + " { display: block !important }";
            this.Add(styleText);
        };
        StyleSheet.prototype.HideFrames = function () {
            this.Hide('frame, iframe, frameset');
        };
        StyleSheet.prototype.Apply = function (body) {
            if (body === void 0) { body = true; }
            if (body && document.body) {
                document.body.appendChild(this.style);
            }
            else {
                document.head.appendChild(this.style);
            }
        };
        return StyleSheet;
    }());
    exports.StyleSheet = StyleSheet;
});
define("helper/Downloader", ["require", "exports", "helper/Script", "helper/ScriptConfig", "helper/Extension"], function (require, exports, Script_3, ScriptConfig_2, Extension_2) {
    "use strict";
    var config = ScriptConfig_2.Config;
    var Downloader = (function () {
        function Downloader() {
            this._captured = false;
            // TODO: ??
        }
        Downloader.prototype.GenerateUrlPart = function (url, filename, ref) {
            return url + "|" + this.GetReferrerUrl(filename) + "|" + this.GetReferrerUrl(ref);
        };
        Downloader.prototype.GetReferrerUrl = function (url) {
            return String(url || location.href).replace(/#.*/, '');
        };
        Downloader.prototype.NormaliseFilename = function (filename) {
            return String(filename).replace(/['"\/\\:|]/g, '_');
        };
        Downloader.prototype.GenerateUri = function (url, filename, ref) {
            switch (config.dUriType) {
                case ScriptConfig_2.UriType.Custom:
                    return "cuwcl4c://|1|" + this.GenerateUrlPart(url, filename, ref);
                case ScriptConfig_2.UriType.Aria:
                    if (!this._captured)
                        this.CaptureAria();
                    return "aria2://|" + this.GenerateUrlPart(url, filename, ref);
            }
            return url;
        };
        Downloader.prototype.CaptureAria = function (el) {
            var _this = this;
            this._captured = true;
            this.SetupAria(false);
            if (!el)
                el = document.body;
            $(el).click(function (e) {
                var el = e.target;
                var $el = $(el);
                var linkEl = ($el.is('a') ? el : $el.parents('a')[0]);
                if (linkEl && linkEl.tagName == 'A' && Extension_2.BeginWith(linkEl.href, 'aria2://|')) {
                    e.stopPropagation();
                    e.preventDefault();
                    var link = linkEl.href.split('|');
                    _this.AddToAria(link[1], decodeURIComponent(link[2]), link[3], linkEl.classList.contains('aria-cookie'));
                }
            });
        };
        Downloader.prototype.AddToAria = function (url, filename, referer, cookie, headers) {
            AriaRequestEvent;
            var ariaParam = {
                out: filename,
                referer: referer || location.href,
                dir: config.sAria_dir,
                'user-agent': navigator.userAgent,
                header: headers || []
            };
            if (cookie === true)
                cookie = document.cookie;
            if (cookie)
                ariaParam.header.push('Cookie: ' + cookie);
            this.aria.addUri([url], ariaParam, function (r) { }, function (b, r) {
                var sErrorMsg;
                if (r.error) {
                    sErrorMsg = "\u9519\u8BEF\u4EE3\u7801 " + r.error.code + ": " + r.error.message;
                }
                else {
                    sErrorMsg = "与 Aria2 后台通信失败, 服务未开启?";
                }
                alert("[" + Script_3.Script.Name + "] \u63D0\u4EA4\u4EFB\u52A1\u53D1\u751F\u9519\u8BEF!\n\n" + sErrorMsg);
            });
        };
        Downloader.prototype.SetupAria = function (forceSetup) {
            if (forceSetup || !this.aria) {
                this.aria = new Aria2({
                    auth: {
                        type: config.dAria_auth,
                        user: config.sAria_user,
                        pass: config.sAria_pass
                    },
                    host: config.sAria_host,
                    port: config.dAria_port
                });
            }
        };
        Downloader.prototype.AddDownload = function (url, file) {
            if (config.dUriType == ScriptConfig_2.UriType.Aria) {
                this.AddToAria(url, file);
            }
            else {
                GM_openInTab(this.GenerateUri(url, file), true);
            }
        };
        return Downloader;
    }());
    exports.Downloader = Downloader;
});
define("SiteRule", ["require", "exports", "helper/Constants", "helper/Extension", "helper/StyleSheet", "helper/Logger"], function (require, exports, Constants_1, Extension_3, StyleSheet_1, Logger_1) {
    "use strict";
    exports.Sites = [];
    function Add(siteRule) {
        siteRule._styleApplied = false;
        exports.Sites.push(siteRule);
    }
    exports.Add = Add;
    function CheckPath(path, rule) {
        if ($.isArray(rule)) {
            for (var i = rule.length; i--;) {
                if (CheckPath(path, rule[i])) {
                    return true;
                }
            }
            return false;
        }
        if ($.isFunction(rule)) {
            return rule(path);
        }
        if (typeof rule === 'string') {
            return Extension_3.BeginWith(path, rule);
        }
        if (rule instanceof RegExp) {
            return rule.test(path);
        }
        return false;
    }
    exports.CheckPath = CheckPath;
    function Check(site, event) {
        if (site.subModule) {
            return false;
        }
        if (typeof site.host == 'string') {
            site.host = [site.host];
        }
        var hosts = site.host.map(function (host) {
            return host.toLowerCase();
        });
        if (!Extension_3.Contains(hosts, Constants_1.lowerHost)) {
            if (site.noSubHost)
                return false;
            var matched = false;
            for (var i = hosts.length; i--;) {
                if (Extension_3.EndWith(hosts[i], Constants_1.topHostMask)) {
                    matched = true;
                    break;
                }
            }
            if (!matched)
                return false;
        }
        if (site.path) {
            return CheckPath(location.pathname, site.path);
        }
        return true;
    }
    exports.Check = Check;
    function Get(id) {
        for (var i = exports.Sites.length; i--;) {
            if (exports.Sites[i].id == id) {
                return exports.Sites[i];
            }
        }
        return null;
    }
    exports.Get = Get;
    function Execute(id, event) {
        switch (event.toLowerCase()) {
            case 'start':
                Get(id).onStart();
                break;
            case 'body':
                Get(id).onBody();
                break;
        }
    }
    exports.Execute = Execute;
    function FireEvent(event) {
        for (var i = exports.Sites.length; i--;) {
            var rule = exports.Sites[i];
            if (Constants_1.isFrame && rule.noFrame)
                continue;
            if (Check(rule, event)) {
                Run(rule, event);
            }
        }
    }
    exports.FireEvent = FireEvent;
    function Run(site, eventName) {
        var event;
        switch (eventName.toLowerCase()) {
            case 'start':
                event = site.onStart;
                break;
            case 'body':
                event = site.onBody;
                break;
            default:
                Logger_1.error("\u65E0\u6548\u7684\u4E8B\u4EF6 " + eventName);
                return;
        }
        if (!site._styleApplied) {
            site._styleApplied = true;
            site.style = new StyleSheet_1.StyleSheet();
            if (site.hide) {
                site.style.Hide(site.hide);
            }
            if (site.show) {
                site.style.Show(site.show);
            }
            if (site.css) {
                site.style.Add(site.css);
            }
            if (site.dl_icon) {
                site.style.Add("\n            \n@font-face {\n\tfont-family: ccc;\n\tsrc: url(https://cdn.bootcss.com/font-awesome/4.2.0/fonts/fontawesome-webfont.woff) format('woff');\n\tfont-weight: normal;\n\tfont-style: normal;\n}\n\n" + Constants_1.downloadIconClass + "::before {\n\tfont-family: ccc;\n\tcontent: \"\f019\";\n\tpadding-right: .5em;\n}\n\n.jx_hide {\n\tdisplay: none;\n}\n\n            ");
            }
        }
        if (!event)
            return;
        Logger_1.info("\u6267\u884C\u89C4\u5219: " + site.id + " \u4E8E " + site.name + " [\u4E8B\u4EF6: " + eventName + "]");
        event.call(this);
    }
    exports.Run = Run;
});
define("site/AA.Config", ["require", "exports", "helper/Constants", "helper/ScriptConfig", "helper/Script", "helper/Downloader"], function (require, exports, Constants_2, ScriptConfig_3, Script_4, Downloader_1) {
    "use strict";
    var rule = {
        bd: null,
        id: 'internal.config',
        name: '脚本配置页面',
        subModule: false,
        includeSubHost: false,
        host: ['localhost.cuwcl4c', 'jixunmoe.github.io'],
        path: ['/conf/', '/cuwcl4c/config'],
        onStart: function () {
            unsafeWindow.rScriptVersion = Constants_2.version;
            unsafeWindow.rScriptConfig = JSON.stringify(ScriptConfig_3.Config);
            var _c = confirm;
            document.addEventListener('SaveConfig', function (e) {
                try {
                    var config = JSON.stringify(JSON.parse(e.detail));
                }
                catch (e) {
                    alert('解析设定值出错!');
                    return;
                }
                if (_c("\u786E\u5B9A\u50A8\u5B58\u8BBE\u5B9A\u81F3 " + Script_4.Script.Name + "?"))
                    GM_setValue(Script_4.Script.Name, config);
            });
        },
        onBody: function () {
            rule.bd = new Downloader_1.Downloader();
            rule.bd.CaptureAria();
        }
    };
    exports.Rules = [rule];
});
define("helper/Wait", ["require", "exports"], function (require, exports) {
    "use strict";
    function WaitUntil(check, cb, nTimeout, nInterval) {
        var _this = this;
        if (nTimeout === void 0) { nTimeout = 10000; }
        if (nInterval === void 0) { nInterval = 150; }
        if ('string' == typeof check) {
            check = check.split('.');
        }
        var isReady;
        if ($.isArray(check)) {
            isReady = function () {
                var r = unsafeWindow;
                for (var i = 0; i < check.length; i++) {
                    r = r[check[i]];
                    if (!r)
                        return false;
                }
                return true;
            };
        }
        else {
            isReady = function () {
                try {
                    return check();
                }
                catch (error) {
                    return false;
                }
            };
        }
        var timer = setInterval(function () {
            if (!isReady()) {
                return;
            }
            clearInterval(timer);
            cb.call(_this);
        }, nInterval);
        if (nTimeout !== true) {
            setTimeout(function () {
                clearInterval(timer);
            }, nTimeout);
        }
    }
    exports.WaitUntil = WaitUntil;
});
define("helper/Redirect", ["require", "exports", "helper/Wait", "helper/Extension", "helper/Logger"], function (require, exports, Wait_1, Extension_4, Logger_2) {
    "use strict";
    /**
     * 跳转后保留当前页面作为 referrer.
     */
    function RedirectTo(url) {
        Logger_2.info("\u51C6\u5907\u8DF3\u8F6C " + url + "...");
        var link = $('<a>')
            .attr('href', url)
            .text("\u6B63\u5728\u8DF3\u8F6C [" + url + "], \u8BF7\u7A0D\u540E.. ")
            .prependTo(document.body)
            .css({ fontSize: 12, color: 'inherit' });
        link[0].click();
    }
    exports.RedirectTo = RedirectTo;
    /**
     * phpDisk 通用跳转文件下载页面函数
     *
     * 返回 true 代表成功
     * 否则代表找不到规则。
     */
    function phpdiskAutoRedirect(callback) {
        if (!callback) {
            callback = document.body ? RedirectTo : function (url) {
                Wait_1.WaitUntil('document.body', function () {
                    RedirectTo(url);
                });
            };
        }
        var rCheckPath = /\/(file)?(file|view)([\/.\-_].*)/;
        if (rCheckPath.test(location.pathname)) {
            callback(location.pathname.replace(rCheckPath, '/$1down$3'));
        }
        else if (Extension_4.BeginWith(location.pathname, '/viewfile')) {
            callback(location.pathname.replace('/viewfile', '/download'));
        }
        else {
            return false;
        }
        return true;
    }
    exports.phpdiskAutoRedirect = phpdiskAutoRedirect;
});
define("site/dl.123564", ["require", "exports", "helper/Extension", "helper/Redirect"], function (require, exports, Extension_5, Redirect_1) {
    "use strict";
    var rule = {
        id: 'dl.123564',
        name: '123564 网盘',
        host: ['123564.com', 'm.123564.com'],
        includeSubHost: false,
        subModule: false,
        hide: '#yzm',
        show: '#download',
        css: "\n.ad1, .ad4{\n    height: 999px !important;\n    width:  0px   !important;\n}\n    ",
        onStart: function () {
            unsafeWindow.killpanads = 1;
        },
        onBody: function () {
            // 文件第一页
            var url = $('.caocuo .jubao').next().find('a').attr('href');
            if (url) {
                Redirect_1.RedirectTo(url);
            }
            else if (Extension_5.Contains(location.pathname, '/downpanel.asp')) {
                // 第三页 - 最终下载地址展示
                url = $("div > a[href*='/down.asp']").attr('href');
                Redirect_1.RedirectTo(url);
            }
            else {
                // 第二页: 填写验证码
                $('#download > a').click();
            }
        }
    };
    exports.Rules = [rule];
});
define("site/dl.5xfile", ["require", "exports", "helper/Extension", "helper/Redirect"], function (require, exports, Extension_6, Redirect_2) {
    "use strict";
    var rule = {
        id: 'dl.123564',
        name: '123564 网盘',
        host: ['123564.com', 'm.123564.com'],
        includeSubHost: false,
        subModule: false,
        hide: '#yzm',
        show: '#download',
        css: "\n.ad1, .ad4{\n    height: 999px !important;\n    width:  0px   !important;\n}\n    ",
        onStart: function () {
            unsafeWindow.killpanads = 1;
        },
        onBody: function () {
            // 文件第一页
            var url = $('.caocuo .jubao').next().find('a').attr('href');
            if (url) {
                Redirect_2.RedirectTo(url);
            }
            else if (Extension_6.Contains(location.pathname, '/downpanel.asp')) {
                // 第三页 - 最终下载地址展示
                url = $("div > a[href*='/down.asp']").attr('href');
                Redirect_2.RedirectTo(url);
            }
            else {
                // 第二页: 填写验证码
                $('#download > a').click();
            }
        }
    };
    exports.Rules = [rule];
});
define("site/dl.baidu", ["require", "exports", "helper/Wait"], function (require, exports, Wait_2) {
    "use strict";
    var rule = {
        id: 'dl.baidu',
        name: '百度盘免下载管家',
        host: ['yun.baidu.com', 'pan.baidu.com'],
        includeSubHost: false,
        subModule: false,
        onStart: function () {
        },
        onBody: function () {
            Wait_2.WaitUntil('require', function () {
                unsafeExec(function () {
                    var require = window.require;
                    var service = require('disk-system:widget/plugin/download/util/downloadCommonUtil.js');
                    service.isPlatformWindows = function () { return false; };
                });
            });
        }
    };
    exports.Rules = [rule];
});
define("site/dl.howfile", ["require", "exports"], function (require, exports) {
    "use strict";
    var rule = {
        id: 'dl.howfile',
        name: '好盘 [howfile.com]',
        host: 'howfile.com',
        includeSubHost: true,
        subModule: false,
        css: "\n#floatdiv {\n    top: 150px;\n    z-index: 99999;\n    display: block !important;\n}\n    ",
        onStart: function () {
        },
        onBody: function () {
        }
    };
    exports.Rules = [rule];
});
define("site/dl.namipan.cc", ["require", "exports"], function (require, exports) {
    "use strict";
    var rule = {
        id: 'dl.namipan',
        name: '纳米盘.cc [原 87盘 应该]',
        host: 'namipan.cc',
        path: ['/file/', '/down.php'],
        includeSubHost: true,
        subModule: false,
        hide: '#box',
        css: "\nbody, body > .ggao {\n    height: initial;\n}\n    ",
        onStart: function () {
        },
        onBody: function () {
            // 下载按钮: #downgo
            var m = location.pathname.match(/\d+/);
            var dlBtn = $('#downgo');
            if (dlBtn.length > 0 && m) {
                var frame = $('<iframe>');
                var note = $('<p>');
                note.text('注意: 需要登录才能下载。').css('color', 'red');
                frame.attr({
                    src: "/down.php?file_id=" + m[0]
                }).css({
                    display: 'table',
                    border: 0,
                    borderBottom: '1px solid #ccc',
                    width: '100%',
                    height: 70
                });
                dlBtn.before(frame);
                frame.after(note);
            }
        }
    };
    exports.Rules = [rule];
});
define("site/dl.xuite", ["require", "exports"], function (require, exports) {
    "use strict";
    var rule = {
        id: 'dl.hami-cloud',
        name: 'Hami+ 個人雲',
        host: ['webhd.xuite.net', 'sync.hamicloud.net'],
        path: '/_oops/',
        includeSubHost: false,
        subModule: false,
        onStart: function () {
        },
        onBody: function () {
            $('#share-download-func-submit').click();
            unsafeExec(function () {
                $(function () {
                    $('#global').data('time', 9);
                });
            });
        }
    };
    exports.Rules = [rule];
});
define("site/fm.douban", ["require", "exports", "helper/Logger", "helper/Wait", "helper/Downloader"], function (require, exports, Logger_3, Wait_3, Downloader_2) {
    "use strict";
    var rule = {
        id: 'fm.douban',
        ssl: true,
        name: '豆瓣电台下载解析',
        host: 'douban.fm',
        includeSubHost: false,
        subModule: false,
        css: "\na#jx_douban_dl {\n\tbackground: #9DD6C5;\n\tpadding: 3px 5px;\n\tcolor: #fff\n}\n\na#jx_douban_dl:hover {\n\tmargin-left: 5px;\n\tpadding-left: 10px;\n\tbackground: #BAE2D6;\n}\n\ndiv#jx_douban_dl_wrap {\n\tfloat: right;\n\tmargin-top: -230px;\n\tmargin-right: -32px;\n\tfont-weight: bold;\n\tfont-family: 'Microsoft JHengHei UI', '\u5FAE\u8F6F\u96C5\u9ED1', serif-sans;\n}\n    ",
        bd: null,
        onStart: function () {
            rule.bd = new Downloader_2.Downloader();
            rule.bd.CaptureAria();
        },
        onBody: function () {
            var linkDownload = $('<a>');
            linkDownload.css('transition', 'all .2s')
                .attr('target', '_blank')
                .attr('id', 'jx_douban_dl')
                .text('下载');
            $('<div>')
                .attr('id', 'jx_douban_dl_wrap')
                .append(linkDownload)
                .insertAfter('.player-wrap');
            Logger_3.info('等待豆瓣电台加载 ..');
            Wait_3.WaitUntil('extStatusHandler', function () {
                Logger_3.info('绑定豆瓣电台函数 ..');
                unsafeOverwriteFunctionSafeProxy({
                    extStatusHandler: function (jsonSongObj) {
                        var event = JSON.parse(jsonSongObj);
                        if ('start' == event.type) {
                            var song = event.song;
                            var file = song.title + song.url.slice(-4);
                            linkDownload
                                .attr('href', rule.bd.GenerateUri(song.url, file))
                                .attr('title', "\u4E0B\u8F7D: " + song.title);
                            Logger_3.info(song.title + " => " + song.url);
                        }
                        throw new ErrorUnsafeSuccess();
                    }
                });
                Logger_3.info('函数绑定完毕, Enjoy~');
            });
        }
    };
    exports.Rules = [rule];
});
define("site/fm.moe", ["require", "exports", "helper/Downloader", "helper/Script"], function (require, exports, Downloader_3, Script_5) {
    "use strict";
    var rule = {
        id: 'fm.moe',
        ssl: true,
        name: '萌否电台',
        host: 'moe.fm',
        includeSubHost: false,
        subModule: false,
        css: "\n\na.jixun-dl {\n    width: 26px !important;\n    background-position: -19px -96px !important;\n    transform: rotate(90deg);\n}\n\n    ",
        bd: null,
        onStart: function () {
            rule.bd = new Downloader_3.Downloader();
            rule.bd.CaptureAria();
        },
        onBody: function () {
            unsafeWindow.is_login = true;
            var dlLink = $('<a>');
            dlLink
                .addClass('player-button left jixun-dl')
                .insertAfter('div.player-button.button-volume');
            Script_5.Script.ListenEvent(function (clip) {
                dlLink
                    .attr('href', rule.bd.GenerateUri(clip.url, clip.sub_title + ".mp3"))
                    .attr('title', "\u4E0B\u8F7D: " + clip.sub_title);
            });
            unsafeExec(function (scriptName) {
                function notifyUpdate(clip) {
                    document.dispatchEvent(new CustomEvent(scriptName, { detail: JSON.stringify(clip) }));
                }
                define('plugin/jixun', function (require, exports) {
                    console.info('[CUWCL4C] 开始注入 ...');
                    var listen = require('/public/js/fm/page/listen.js');
                    var player = require('player/player');
                    var _initPlayer = player.initPlayer;
                    player.initPlayer = function (clip) {
                        notifyUpdate(clip);
                        _initPlayer.apply(this, arguments);
                    };
                    console.info('[CUWCL4C] 注入结束 ...');
                });
                // 要求载入外挂模组
                seajs.use('plugin/jixun');
            }, Script_5.Script.Name);
        }
    };
    exports.Rules = [rule];
});
define("Rules", ["require", "exports", "SiteRule", "site/AA.Config", "site/dl.123564", "site/dl.5xfile", "site/dl.baidu", "site/dl.howfile", "site/dl.namipan.cc", "site/dl.xuite", "site/fm.douban", "site/fm.moe"], function (require, exports, SiteRule_1, a, b, c, d, e, f, g, h, i) {
    "use strict";
    a.Rules.forEach(SiteRule_1.Add);
    b.Rules.forEach(SiteRule_1.Add);
    c.Rules.forEach(SiteRule_1.Add);
    d.Rules.forEach(SiteRule_1.Add);
    e.Rules.forEach(SiteRule_1.Add);
    f.Rules.forEach(SiteRule_1.Add);
    g.Rules.forEach(SiteRule_1.Add);
    h.Rules.forEach(SiteRule_1.Add);
    i.Rules.forEach(SiteRule_1.Add);
});
define("EntryPoint", ["require", "exports", "helper/Script", "helper/Constants", "helper/ScriptConfig", "helper/QueryString", "helper/Logger", "SiteRule"], function (require, exports, Script_6, Constants_3, ScriptConfig_4, QueryString_1, Logger_4, SiteRule_2) {
    "use strict";
    var $_GET = QueryString_1.Parse(Constants_3.currentUrl);
    if (ScriptConfig_4.Config.bUseCustomRules) {
        var customRules = [];
        try {
            customRules = eval("[" + ScriptConfig_4.Config.sCustomRule + "]");
            customRules.forEach(function (rule) {
                SiteRule_2.Sites.push(rule);
            });
        }
        catch (ex) {
            Logger_4.error("\u89E3\u6790\u81EA\u5B9A\u4E49\u89C4\u5219\u53D1\u751F\u9519\u8BEF: " + ex.message);
        }
    }
    GM_registerMenuCommand("\u914D\u7F6E " + Script_6.Script.Name, function () {
        GM_openInTab(Script_6.Script.Config, false);
    });
    SiteRule_2.FireEvent('start');
    $(function () {
        SiteRule_2.FireEvent('body');
    });
});