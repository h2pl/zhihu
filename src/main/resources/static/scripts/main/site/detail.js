(function (window, undefined) {
    var Action = Base.createClass('main.util.Action');

    Base.ready({
        initialize: fInitialize,
        // 事件代理
        events: {
            'click .js-like': fVote,
            'click .js-dislike': fVote
        }
    });

    function fInitialize() {
        var that = this;
    }

    function fVote(oEvent) {
        var that = this;
        var oEl = $(oEvent.currentTarget);
        var oDv = oEl.closest('div.js-vote');
        var sId = $.trim(oDv.attr('data-id'));
        var bLike = oEl.hasClass('js-like');
        if (!sId) {
            return;
        }
        if (that.isVote) {
            return;
        }
        that.isVote = true;
        Action[bLike ? 'like' : 'dislike']({
            commentId: sId,
            call: function (oResult) {
                // 调整样式
                oDv.find('.pressed').removeClass('pressed');
                oDv.find(bLike ? '.js-like' : '.js-dislike').addClass('pressed');
                // 更新数量
                oDv.closest('div.js-comment').find('span.js-voteCount').html(oResult.msg);
            },
            error: function (oResult) {
                if (oResult.code === 999) {
                    alert('请登录后再操作');
                    window.location.href = '/reglogin?next=' + window.decodeURIComponent(window.location.href);
                } else {
                    alert('出现错误，请重试');
                }
            },
            always: function () {
                that.isVote = false;
            }
        });
    }

    function fUnlike(oEvent) {
        var that = this;
        var oEl = $(oEvent.currentTarget);

    }

})(window);