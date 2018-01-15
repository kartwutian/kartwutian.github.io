
;(function () {
    'use strict';

    if (!Date.now)
        Date.now = function () { return new Date().getTime(); };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
        var vp = vendors[i];
        window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = (window[vp + 'CancelAnimationFrame']
        || window[vp + 'CancelRequestAnimationFrame']);
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
        || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
        var lastTime = 0;
        window.requestAnimationFrame = function (callback) {
            var now = Date.now();
            var nextTime = Math.max(lastTime + 16, now);
            return setTimeout(function () { callback(lastTime = nextTime); },
                nextTime - now);
        };
        window.cancelAnimationFrame = clearTimeout;
    }
}());



/**
 * 在window 对象上注册一个$util对象
 * 里面封装一些全局的公用方法
 *
 */
!function (win,doc) {

    // 如果window上已经有$utils方法，抛出错误并返回
    if( win.$utils ){
        console.log('window对象上已经注册了$utils,请检查代码')
        alert('window对象上已经注册了$utils,请检查代码')
        return
    }

    win.$utils = {
        log: function () {
            Array.prototype.forEach.call(arguments,function (key) {
                console.log(key)
            })
        },
        isIOS: function () {
            return !!(window.navigator && window.navigator.userAgent || '').match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
        },
        isColor: function (value) {
            var colorReg = /^#([a-fA-F0-9]){3}(([a-fA-F0-9]){3})?$/;
            var rgbaReg = /^[rR][gG][bB][aA]\(\s*((25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*){3}\s*(\.|\d+\.)?\d+\s*\)$/;
            var rgbReg = /^[rR][gG][bB]\(\s*((25[0-5]|2[0-4]\d|1?\d{1,2})\s*,\s*){2}(25[0-5]|2[0-4]\d|1?\d{1,2})\s*\)$/;

            return colorReg.test(value) || rgbaReg.test(value) || rgbReg.test(value);
        },
        pageScroll: (function () {
            var fn = function (e) {
                e.preventDefault();
                e.stopPropagation();
            };
            var islock = false;

            return {
                lock: function (el) {
                    if (islock) return;
                    islock = true;
                    (el || document).addEventListener('touchmove', fn);
                },
                unlock: function (el) {
                    islock = false;
                    (el || document).removeEventListener('touchmove', fn);
                }
            };
        })(),
        scrollTo: function(el,distination,duration){
            var el = el || window.document
            var distination = distination || 0
            var duration = duration || 300

            var start = el.scrollTop

            var times =Math.round( duration/16.666666666666667 )
            var step = Math.round(( distination - start ) / times)

            function tick() {
                times --
                if(times>0){
                    el.scrollTop +=  step
                    requestAnimationFrame(tick)
                    return
                }
                el.scrollTop = distination
            }
            tick()
        },
        getScrollview: function (el) {
            let currentNode = el;
            while (currentNode && currentNode.tagName !== 'HTML' && currentNode.tagName !== 'BODY' && currentNode.nodeType === 1) {
                let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY;
                if (overflowY === 'scroll' || overflowY === 'auto') {
                    return currentNode;
                }
                currentNode = currentNode.parentNode;
            }
            return window;
        },
        hasClass: function (elem, cls) {
            cls = cls || '';
            if (cls.replace(/\s/g, '').length == 0) return false;
            return new RegExp(' ' + cls + ' ').test(' ' + elem.className + ' ');
        },
        addClass: function (ele, cls) {
            if (!this.hasClass(ele, cls)) {
                ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
            }
        },
        removeClass: function (ele, cls) {
            if (this.hasClass(ele, cls)) {
                let newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
                while (newClass.indexOf(' ' + cls + ' ') >= 0) {
                    newClass = newClass.replace(' ' + cls + ' ', ' ');
                }
                ele.className = newClass.replace(/^\s+|\s+$/g, '');
            }
        },
        getData: function(el, name, val) {
            const prefix = 'data-'
            if (val) {
                return el.setAttribute(prefix + name, val)
            }
            return el.getAttribute(prefix + name)
        },
        prefixStyle: function (style) {
            var elementStyle = document.createElement('div').style

            var vendor = (function() {
                var transformNames = {
                    webkit: 'webkitTransform',
                    Moz: 'MozTransform',
                    O: 'OTransform',
                    ms: 'msTransform',
                    standard: 'transform'
                }

                for (var key in transformNames) {
                    if (elementStyle[transformNames[key]] !== undefined) {
                        return key
                    }
                }

                return false
            })()

            if (vendor === false) {
                return false
            }

            if (vendor === 'standard') {
                return style
            }

            return vendor + style.charAt(0).toUpperCase() + style.substr(1)
        },
        removeElement: function (el) {
            var parent = el.parentNode;
            parent.removeChild(el)
        },
        parabola: function (options) {
            function _getTime(v,a,s) {
                let t = 0;
                while (v*t/1000 + 1/2*a*Math.pow(t/1000,2) <= s){
                    t++
                }
                return t
            }
            var startX = options.startX
            var startY = options.startY
            var endX = options.endX
            var endY = options.endY
            var callback = options.callback

            var deltaX = endX - startX
            var deltaY = endY - startY
            var vy = -150
            var duration = _getTime(vy,1000,deltaY)
            var vx = deltaX/duration
            var startTime = Date.now()
            var oEl = document.createElement('div')
            oEl.style = 'width: .2rem;height:.2rem;border-radius: 50%;background-color:#ffb400;position:fixed;left:'+startX+'px;top:'+startY+'px;'
            document.body.appendChild(oEl)
            function tick() {
                var times = Date.now()-startTime
                if(times < duration){
                    oEl.style.left = startX + vx*times + 'px'
                    oEl.style.top = startY + vy*times/1000+1/2*1000*Math.pow(times/1000,2) + 'px'
                    requestAnimationFrame(tick)
                    return
                }
                oEl.style.left = endX + 'px'
                oEl.style.top = endY + 'px'
                $utils.removeElement(oEl)
                callback && callback()

            }
            tick()
        }

    }

}(window,document);


