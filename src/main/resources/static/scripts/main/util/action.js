(function (window, undefined) {
    var Action = Base.createClass('main.util.Action');
    $.extend(Action, {
        like: fLike,
        dislike: fDislike,
        followUser: fFollowUser,
        unFollowUser: fUnFollowUser,
        followQuestion: fFollowQuestion,
        unFollowQuestion: fUnFollowQuestion,
        post: fPost
    });

    /**
     * 喜欢
     * @param   {Object} oConf
     *  @param  {String} oConf.commentId 对象id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fLike(oConf) {
        var that = this;
        that.post({
            url: '/like',
            data: {commentId: oConf.commentId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 不喜欢
     * @param   {Object} oConf
     *  @param  {String} oConf.commentId 对象id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fDislike(oConf) {
        var that = this;
        that.post({
            url: '/dislike',
            data: {commentId: oConf.commentId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 关注用户
     * @param   {Object} oConf
     *  @param  {String} oConf.userId 用户id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fFollowUser(oConf) {
        var that = this;
        that.post({
            url: '/followUser',
            data: {userId: oConf.userId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 取消关注用户
     * @param   {Object} oConf
     *  @param  {String} oConf.userId 用户id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fUnFollowUser(oConf) {
        var that = this;
        that.post({
            url: '/unfollowUser',
            data: {userId: oConf.userId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 关注问题
     * @param   {Object} oConf
     *  @param  {String} oConf.questionId 问题id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fFollowQuestion(oConf) {
        var that = this;
        that.post({
            url: '/followQuestion',
            data: {questionId: oConf.questionId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 取消关注问题
     * @param   {Object} oConf
     *  @param  {String} oConf.questionId 问题id
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fUnFollowQuestion(oConf) {
        var that = this;
        that.post({
            url: '/unfollowQuestion',
            data: {questionId: oConf.questionId},
            call: oConf.call,
            error: oConf.error,
            always: oConf.always
        });
    }

    /**
     * 简单的 ajax 请求封装
     * @param   {Object} oConf
     *  @param  {String} oConf.method 请求类型
     *  @param  {String} oConf.url 请求连接
     *  @param  {Object} oConf.data 发送参数
     *  @param  {Function} oConf.call 成功回调
     *  @param  {Function} oConf.error 失败回调
     *  @param  {Function} oConf.always 操作的回调
     */
    function fPost(oConf) {
        var that = this;
        $.ajax({
            method: oConf.method || 'POST',
            url: oConf.url,
            dataType: 'json',
            data: oConf.data
        }).done(function (oResult) {
            var nCode = oResult.code;
            if (oResult.code === 999) {
                // 未登录
                alert('未登录');
                window.location.href = '/reglogin?next=' + window.encodeURI(window.location.href);
                return;
            }
            nCode === 0 && oConf.call && oConf.call(oResult);
            nCode !== 0 && oConf.error && oConf.error(oResult);
        }).fail(oConf.error).always(oConf.always);
    }

})(window);