/**
var oPopupAdd = new PopupAdd({
    data: 初始数据
    ok: Function, 发布成功后的回调
});
 */
(function (window) {
    var PopupAdd = Base.createClass('main.component.PopupAdd');
    var Popup = Base.getClass('main.component.Popup');
    var Component = Base.getClass('main.component.Component');
    var Util = Base.getClass('main.base.Util');

    Base.mix(PopupAdd, Component, {
        _tpl: [
            '<div class="zh-add-question-form">',
                '<div class="zg-section-big clearfix">',
                    '<div class="zg-form-text-input add-question-title-form" style="position: relative;">',
                        '<input type="text" class="js-title zg-editor-input zu-seamless-input-origin-element" placeholder="写下你的问题" style="height:22px;min-height:auto;"></textarea>',
                    '</div>',
                '</div>',
                '<div class="zg-section-big">',
                    '<div class="add-question-section-title">问题说明（可选）：</div>',
                    '<div id="zh-question-suggest-detail-container" class="zm-editable-status-editing">',
                        '<div class="zm-editable-editor-wrap no-toolbar">',
                            '<div class="zm-editable-editor-outer">',
                                '<div class="zm-editable-editor-field-wrap">',
                                    '<textarea class="js-content zm-editable-editor-field-element editable" placeholder="问题背景、条件等详细信息" style="font-style:italic;width:98%;"></textarea>',
                                '</div>',
                            '</div>',
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
                that.titleIpt = oEl.find('.js-title');
                that.contentIpt = oEl.find('.js-content');
                // 还原值
                oConf.data && that.val(oConf.data);
            }
        }],
        show: fStaticShow
    }, {
        initialize: fInitialize,
        val: fVal
    });

    function fStaticShow(oConf) {
        var that = this;
        var oAdd = new PopupAdd(oConf);
        var bSubmit = false;
        var oPopup = new Popup({
            width: 540,
            title: '提问',
            okTxt: '发布',
            content: oAdd.html(),
            ok: function () {
                var that = this;
                var oData = oAdd.val();
                if (!oData.title) {
                    that.error('请填写标题');
                    return true;
                }
                // 避免重复提交
                if (bSubmit) {
                    return true;
                }
                bSubmit = true;
                // 提交内容
                $.ajax({
                    url: '/question/add',
                    type: 'post',
                    data: oData,
                    dataType: 'json'
                }).done(function (oResult) {
                    // 未登陆，跳转到登陆页面
                    if (oResult.code === 999) {
                        window.location.href = '/reglogin?next=' + window.encodeURIComponent(window.location.href);
                    } else {
                        oConf.ok && oConf.ok.call(that);
                        oAdd.emit('ok');
                    }
                }).fail(function () {
                    alert('出现错误，请重试');
                }).always(function () {
                    bSubmit = false;
                });
                // 先不关闭
                return true;
            },
            listeners: {
                destroy: function () {
                    oAdd.destroy();
                }
            }
        });
        oAdd._popup = oPopup;
        Component.setEvents();
    }

    function fInitialize(oConf) {
        var that = this;
        delete oConf.renderTo;
        PopupAdd.superClass.initialize.apply(that, arguments);
    }

    function fVal(oData) {
        var that = this;
        if (arguments.length === 0) {
            return {
                title: $.trim(that.titleIpt.val()),
                content: $.trim(that.contentIpt.val())
            };
        } else {
            oData = oData || {};
            that.titleIpt.val($.tirm(oData.title));
            that.contentIpt.val($.trim(oData.content));
        }
    }

})(window);