/**
var oPopup = new Popup({
   title: String, 标题
   content: String, 内容
   width: Number, 宽度
   close: Function, 关闭的回调
   cancel: Function, 取消的回调
   ok: Function, 确定的回调
   hasNoHeader: Boolean, true 没有头部
   hasNoFooter: Boolean, true 没有底部
   cancelTxt: 取消文案
   okTxt: 确认文案
});
 */
(function (window, undefined) {
    var Popup = Base.createClass('main.component.Popup');
    var Component = Base.getClass('main.component.Component');
    Base.mix(Popup, Component, {
        zIndex: 100,
        _tpl: [
            '<div class="modal-dialog absolute-position" style="margin:0;padding:0;">',
                '<div class="modal-dialog-title js-head">',
                    '<span class="modal-dialog-title-text js-title">#{title}</span>',
                    '<span class="modal-dialog-title-close js-close"></span>',
                '</div>',
                '<div class="modal-dialog-content">',
                    '<div class="zh-add-question-form">',
                        '<div class="js-content">#{content}</div>',
                        '<div class="zm-command js-footer">',
                            '<span style="display:none;margin-left:10px;line-height:30px;float:left;color:#c33;" class="js-error"></span>',
                            '<a href="javascript:void(0);" class="zm-command-cancel js-cancel">#{cancelTxt}</a>',
                            '<a href="javascript:void(0);" class="zg-r5px zu-question-form-add zg-btn-blue js-ok">#{okTxt}</a>',
                        '</div>',
                    '</div>',
                '</div>',
            '</div>'].join(''),
        listeners: [{
            name: 'render',
            type: 'custom',
            handler: function () {
                var that = this;
                var oConf = that.rawConfig;
                var oEl = that.getEl();
                // 常用元素
                that.titleEl = oEl.find('span.js-title');
                that.contentEl = oEl.find('div.js-content');
                that.tipsEl = oEl.find('span.js-error');
                // 调整大小
                oEl.outerWidth(oConf.width || 520);
                oConf.height && that.contentEl.outerHeight(oConf.height);
                // 禁止body滚动
                that.forbidScroll(document.body);
                // 创建遮罩层
                that.initMask();
                // 调整z-index
                oEl.css('zIndex', Popup.zIndex++);
                // 去掉头部
                oConf.hasNoHeader && oEl.find('div.js-head').remove();
                // 去掉底部
                oConf.hasNoFooter && oEl.find('div.js-footer').remove();
                // 位置居中
                that.fixPosition();
                // 绑定窗口变化事件
                that.resizeCb = Base.bind(that.fixPosition, that);
                $(window).resize(that.resizeCb);
            }
        }, {
            name: 'destroy',
            type: 'custom',
            handler: function () {
                var that = this;
                // 启动滚动
                !that.isForbidScroll && that.forbidScroll(document.body, false);
                // 移除遮罩层
                that.maskEl && that.maskEl.remove();
                // 取消窗口变化事件
                $(window).unbind('resize', that.resizeCb);
            }
        }, {
            name: 'click .js-close',
            handler: function () {
                var that = this;
                that.close();
            }
        }, {
            name: 'click .js-cancel',
            handler: function () {
                var that = this;
                var oConf = that.rawConfig;
                oConf.cancel && oConf.cancel.call(that);
                that.close(true);
            }
        }, {
            name: 'click .js-ok',
            handler: function () {
                var that = this;
                var oConf = that.rawConfig;
                // 禁止返回
                if (oConf.ok && oConf.ok.call(that) === true) {
                    return;
                }
                that.close(true);
            }
        }]
    }, {
        initialize: fInitialize,
        initMask: fInitMask,
        fixPosition: fFixPosition,
        close: fClose,
        error: fError,
        getData: fGetData
    });

    function fInitialize(oConf) {
        var that = this;
        var oBody = $(document.body);
        oConf.renderTo = oBody;
        that.isForbidScroll = oBody.css('overflow-y') === 'hidden';
        Popup.superClass.initialize.apply(that, arguments);
    }

    function fInitMask() {
        var that = this;
        var oConf = that.rawConfig;
        if (!that.maskEl) {
            that.maskEl = $('<div class="masklayer" style="position:absolute;z-index:' + (Popup.zIndex++) + '"></div>');
            oConf.renderTo.append(that.maskEl);
        }
    }

    function fFixPosition() {
        var that = this;
        var oEl = that.getEl();
        var oWin = $(window);
        var oDoc = $(document);
        var nElWidth = oEl.width();
        var nElHeight = oEl.height();
        var nWinWidth = oWin.width();
        var nWinHeight = oWin.height();
        var nScrollTop = Math.max(oWin.scrollTop() || oDoc.scrollTop());
        // 调整元素大小
        oEl.css({
            left: nWinWidth > nElWidth ? (nWinWidth - nElWidth) / 2 : 0,
            top: (nWinHeight > nElHeight ? (nWinHeight - nElHeight) / 2 : 0) + nScrollTop
        });
        // 调整遮罩层大小
        that.maskEl.css({
            width: '100%',
            height: nWinHeight,
            top: nScrollTop
        });
    }

    function fClose(bNoEmit) {
        var that = this;
        !bNoEmit && that.emit('close');
        that.destroy();
    }

    function fError(sContent) {
        var that = this;
        sContent = $.trim(sContent);
        that.tipsEl.html(sContent);
        that.tipsEl[sContent ? 'show' : 'hide']();
    }

    function fGetData(oConf) {
        var that = this;
        return {
            title: oConf.title || '提示',
            content: oConf.content,
            cancelTxt: oConf.cancelTxt || '取消',
            okTxt: oConf.okTxt || '确定'
        };
    }

})(window);